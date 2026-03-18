import Shop     from "../stores/stores.model.js";
import User     from "../auth/auth.model.js";
import Review   from "../reviews/reviews.model.js";
import mongoose from "mongoose";
import fs       from "fs";
import path     from "path";

// ── Save buffer files (memoryStorage) to disk ─────────────────────────────────
const saveFiles = (files = []) => {
  if (!files.length) return [];

  const uploadDir = path.join(process.cwd(), "uploads", "reviews");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  return files.map((file) => {
    const ext      = path.extname(file.originalname) || ".jpg";
    const filename = `review-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const filepath = path.join(uploadDir, filename);
    fs.writeFileSync(filepath, file.buffer);
    return `/uploads/reviews/${filename}`;
  });
};

/* ── recalc shop avgRating + reviewCount ─────────────────────── */
const recalcStats = async (shopId) => {
  const shop = await Shop.findById(shopId);
  if (!shop) return;

  const separateReviews = await Review.find({ shop: shopId, isVisible: { $ne: false } });
  const embeddedReviews = (shop.reviews || []).filter((r) => r.isVisible !== false);

  const separateUserIds = new Set(separateReviews.map((r) => r.user.toString()));
  const uniqueEmbedded  = embeddedReviews.filter((r) => !separateUserIds.has(r.user.toString()));

  const allReviews = [...separateReviews, ...uniqueEmbedded];
  const count      = allReviews.length;
  const avg        = count === 0 ? 0 : allReviews.reduce((s, r) => s + r.rating, 0) / count;

  // ✅ updateOne skips full document validation — no enum errors on category
  await Shop.updateOne(
    { _id: shopId },
    {
      $set: {
        avgRating:   Math.round(avg * 10) / 10,
        reviewCount: count,
      },
    }
  );
};

/* ── push notification ───────────────────────────────────────── */
const notify = async (userId, payload) => {
  await User.findByIdAndUpdate(userId, {
    $push: {
      notifications: {
        $each:     [{ ...payload, read: false }],
        $slice:    -50,
        $position: 0,
      },
    },
  });
};

/* ── populate user fields ────────────────────────────────────── */
const populateUsers = async (reviews) => {
  const userIds = [...new Set(
    reviews.map((r) => (r.user?._id ?? r.user)?.toString()).filter(Boolean)
  )];
  const users   = await User.find({ _id: { $in: userIds } }).select("name avatar city");
  const userMap = {};
  users.forEach((u) => { userMap[u._id.toString()] = u; });
  return reviews.map((r) => {
    const uid = (r.user?._id ?? r.user)?.toString();
    return { ...(r.toObject ? r.toObject() : r), user: userMap[uid] ?? r.user };
  });
};

/* ── Public: get shop reviews ───────────────────────────────── */
export const getShopReviews = async (shopId, { page = 1, limit = 10, sort = "newest" } = {}) => {
  if (!shopId || !mongoose.Types.ObjectId.isValid(shopId)) {
    return { reviews: [], total: 0 };
  }

  let query = Review.find({ shop: shopId, isVisible: { $ne: false } })
    .populate("user", "name avatar city");

  if      (sort === "highest") query = query.sort({ rating: -1 });
  else if (sort === "lowest")  query = query.sort({ rating:  1 });
  else if (sort === "helpful") query = query.sort({ "helpfulVotes.length": -1 });
  else                         query = query.sort({ createdAt: -1 });

  const total   = await Review.countDocuments({ shop: shopId, isVisible: { $ne: false } });
  const skip    = (Number(page) - 1) * Number(limit);
  const reviews = await query.skip(skip).limit(Number(limit));

  const shop = await Shop.findById(shopId).select("reviews");
  if (shop?.reviews?.length > 0) {
    const separateUserIds = new Set(reviews.map((r) => r.user?._id?.toString() ?? r.user?.toString()));
    const embeddedOnly    = shop.reviews.filter(
      (r) => r.isVisible !== false && !separateUserIds.has(r.user?.toString())
    );
    if (embeddedOnly.length > 0) {
      const populated = await populateUsers(embeddedOnly);
      const combined  = [...reviews.map((r) => r.toObject ? r.toObject() : r), ...populated];
      if      (sort === "highest") combined.sort((a, b) => b.rating - a.rating);
      else if (sort === "lowest")  combined.sort((a, b) => a.rating - b.rating);
      else                         combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return { reviews: combined, total: total + embeddedOnly.length };
    }
  }

  return { reviews: reviews.map((r) => r.toObject ? r.toObject() : r), total };
};

/* ── Create a review ─────────────────────────────────────────── */
export const createReview = async (userId, shopId, data, files = []) => {
  const shop = await Shop.findById(shopId);
  if (!shop) throw { status: 404, message: "Shop not found" };

  const existingInCollection = await Review.findOne({ shop: shopId, user: userId });
  const existingEmbedded     = shop.reviews?.find((r) => r.user.toString() === userId.toString());
  if (existingInCollection || existingEmbedded) {
    throw { status: 400, message: "You have already reviewed this store." };
  }

  const rating = Number(data.rating);
  if (!rating || rating < 1 || rating > 5) {
    throw { status: 422, message: "Rating must be a number between 1 and 5" };
  }

  const text   = (data.comment ?? data.body ?? data.text ?? "").toString().trim();
  const photos = saveFiles(files);

  const review = await Review.create({
    shop: shopId,
    user: userId,
    rating,
    text,
    aspects: data.aspects || {},
    photos,
    replied: false,
  });

  await recalcStats(shopId);

  if (shop.owner) {
    await notify(shop.owner, {
      type:  "new_review",
      title: "New review on your store",
      body:  `Someone left a ${rating}-star review.`,
      store: shopId,
    });
  }

  const populated = await Review.findById(review._id).populate("user", "name avatar city");
  return populated;
};

/* ── Update a review ─────────────────────────────────────────── */
export const updateReview = async (userId, reviewId, data, files = []) => {
  let review = await Review.findById(reviewId);

  if (review) {
    if (review.user.toString() !== userId.toString()) throw { status: 403, message: "Not your review" };
    if (data.rating  !== undefined) review.rating  = Number(data.rating);
    if (data.comment !== undefined) review.text    = data.comment;
    if (data.body    !== undefined) review.text    = data.body;
    if (data.text    !== undefined) review.text    = data.text;
    if (data.aspects !== undefined) review.aspects = data.aspects;
    const newPhotos = saveFiles(files);
    if (newPhotos.length > 0) review.photos = newPhotos;
    await review.save();
    await recalcStats(review.shop);
    return review;
  }

  const shop = await Shop.findOne({ "reviews._id": reviewId });
  if (!shop) throw { status: 404, message: "Review not found" };
  const embedded = shop.reviews.id(reviewId);
  if (!embedded) throw { status: 404, message: "Review not found" };
  if (embedded.user.toString() !== userId.toString()) throw { status: 403, message: "Not your review" };
  if (data.rating  !== undefined) embedded.rating  = Number(data.rating);
  if (data.comment !== undefined) embedded.text    = data.comment;
  if (data.body    !== undefined) embedded.text    = data.body;
  if (data.text    !== undefined) embedded.text    = data.text;
  if (data.aspects !== undefined) embedded.aspects = data.aspects;
  const newPhotos = saveFiles(files);
  if (newPhotos.length > 0) embedded.photos = newPhotos;
  await shop.save();
  await recalcStats(shop._id);
  return embedded;
};

/* ── Delete a review ─────────────────────────────────────────── */
export const deleteReview = async (userId, reviewId) => {
  const review = await Review.findById(reviewId);
  if (review) {
    if (review.user.toString() !== userId.toString()) throw { status: 403, message: "Not your review" };
    const shopId = review.shop;
    await Review.findByIdAndDelete(reviewId);
    await recalcStats(shopId);
    return;
  }

  const shop = await Shop.findOne({ "reviews._id": reviewId });
  if (!shop) throw { status: 404, message: "Review not found" };
  const embedded = shop.reviews.id(reviewId);
  if (!embedded) throw { status: 404, message: "Review not found" };
  if (embedded.user.toString() !== userId.toString()) throw { status: 403, message: "Not your review" };
  shop.reviews.pull(reviewId);
  await shop.save();
  await recalcStats(shop._id);
};

/* ── Toggle helpful ──────────────────────────────────────────── */
export const toggleHelpful = async (userId, reviewId) => {
  const review = await Review.findById(reviewId);
  if (review) {
    const idx = review.helpfulVotes.findIndex((id) => id.toString() === userId.toString());
    if (idx > -1) {
      review.helpfulVotes.splice(idx, 1);
    } else {
      review.helpfulVotes.push(userId);
      await notify(review.user, {
        type:  "helpful_vote",
        title: "Your review was found helpful",
        body:  "Someone marked your review as helpful!",
        store: review.shop,
      });
    }
    await review.save();
    return { helpfulCount: review.helpfulVotes.length };
  }

  const shop = await Shop.findOne({ "reviews._id": reviewId });
  if (!shop) throw { status: 404, message: "Review not found" };
  const embedded = shop.reviews.id(reviewId);
  if (!embedded) throw { status: 404, message: "Review not found" };
  const idx = embedded.helpfulVotes.findIndex((id) => id.toString() === userId.toString());
  if (idx > -1) {
    embedded.helpfulVotes.splice(idx, 1);
  } else {
    embedded.helpfulVotes.push(userId);
  }
  await shop.save();
  return { helpfulCount: embedded.helpfulVotes.length };
};

/* ── Owner reply ─────────────────────────────────────────────── */
export const ownerReply = async (ownerId, reviewId, text) => {
  const review = await Review.findById(reviewId);
  if (review) {
    const shop = await Shop.findOne({ _id: review.shop, owner: ownerId });
    if (!shop) throw { status: 404, message: "Review not found or not your shop" };
    review.ownerReply = { text, repliedAt: new Date() };
    review.replied    = true;
    await review.save();
    await notify(review.user, {
      type:  "review_reply",
      title: `${shop.name} replied to your review`,
      body:  text.slice(0, 100),
      store: shop._id,
    });
    return review;
  }

  const shop = await Shop.findOne({ owner: ownerId, "reviews._id": reviewId });
  if (!shop) throw { status: 404, message: "Review not found" };
  const embedded = shop.reviews.id(reviewId);
  if (!embedded) throw { status: 404, message: "Review not found" };
  embedded.ownerReply = { text, repliedAt: new Date() };
  embedded.replied    = true;
  await shop.save();
  await notify(embedded.user, {
    type:  "review_reply",
    title: `${shop.name} replied to your review`,
    body:  text.slice(0, 100),
    store: shop._id,
  });
  return embedded;
};

/* ── Delete owner reply ──────────────────────────────────────── */
export const deleteOwnerReply = async (ownerId, reviewId) => {
  const review = await Review.findById(reviewId);
  if (review) {
    const shop = await Shop.findOne({ _id: review.shop, owner: ownerId });
    if (!shop) throw { status: 404, message: "Review not found or not your shop" };
    review.ownerReply = { text: "", repliedAt: null };
    review.replied    = false;
    await review.save();
    return;
  }

  const shop = await Shop.findOne({ owner: ownerId, "reviews._id": reviewId });
  if (!shop) throw { status: 404, message: "Review not found" };
  const embedded = shop.reviews.id(reviewId);
  if (!embedded) throw { status: 404, message: "Review not found" };
  embedded.ownerReply = { text: "", repliedAt: null };
  embedded.replied    = false;
  await shop.save();
};

/* ── User's own reviews ──────────────────────────────────────── */
export const getUserReviews = async (userId) => {
  const fromCollection = await Review.find({ user: userId })
    .sort({ createdAt: -1 })
    .populate("shop", "name category location logo");

  const collectionShopIds = new Set(fromCollection.map((r) => r.shop?._id?.toString() ?? r.shop?.toString()));
  const shops = await Shop.find({ "reviews.user": userId }).select("name category location logo reviews");

  const fromEmbedded = [];
  shops.forEach((shop) => {
    if (collectionShopIds.has(shop._id.toString())) return;
    shop.reviews
      .filter((r) => r.user.toString() === userId.toString())
      .forEach((r) => {
        fromEmbedded.push({
          ...r.toObject(),
          shop: { _id: shop._id, name: shop.name, category: shop.category, location: shop.location, logo: shop.logo },
        });
      });
  });

  return [
    ...fromCollection.map((r) => r.toObject ? r.toObject() : r),
    ...fromEmbedded,
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};
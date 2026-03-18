import Shop   from "../stores/stores.model.js";
import User   from "../auth/auth.model.js";
import Review from "../reviews/reviews.model.js";

// ── Dashboard stats ───────────────────────────────────────────
export const getDashboardStats = async () => {
  const [
    totalUsers, totalShops, totalReviews,
    pendingShops, activeShops, rejectedShops,
    newUsersThisMonth, newShopsThisMonth,
    recentShops, recentUsers, topShops,
  ] = await Promise.all([
    User.countDocuments(),
    Shop.countDocuments(),
    Review.countDocuments(),
    Shop.countDocuments({ isActive: false }),
    Shop.countDocuments({ isActive: true, isVerified: true }),
    Shop.countDocuments({ isVerified: false, isActive: true }),
    User.countDocuments({ createdAt: { $gte: new Date(new Date().setDate(1)) } }),
    Shop.countDocuments({ createdAt: { $gte: new Date(new Date().setDate(1)) } }),
    Shop.find().sort({ createdAt: -1 }).limit(5).populate("owner", "name email"),
    User.find().sort({ createdAt: -1 }).limit(5).select("name email role createdAt"),
    Shop.find({ isVerified: true }).sort({ avgRating: -1 }).limit(5).select("name avgRating reviewCount category"),
  ]);

  return {
    stats: {
      totalUsers, totalShops, totalReviews,
      pendingShops, activeShops, rejectedShops,
      newUsersThisMonth, newShopsThisMonth,
    },
    recentShops,
    recentUsers,
    topShops,
  };
};

// ── Users ─────────────────────────────────────────────────────
export const getUsers = async ({ page = 1, limit = 10, search, role } = {}) => {
  const filter = {};
  if (role   && role   !== "all") filter.role = role;
  if (search) {
    filter.$or = [
      { name:  { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { city:  { $regex: search, $options: "i" } },
    ];
  }
  const total = await User.countDocuments(filter);
  const users = await User.find(filter)
    .select("-password -resetPasswordToken -resetPasswordExpires")
    .sort({ createdAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));
  return { users, total, page: Number(page), limit: Number(limit) };
};

export const getUser = async (id) => {
  const user = await User.findById(id).select("-password -resetPasswordToken -resetPasswordExpires");
  if (!user) throw { status: 404, message: "User not found" };
  return user;
};

export const updateUser = async (id, data) => {
  const allowed = ["name", "email", "phone", "city", "role", "avatar"];
  const update  = {};
  allowed.forEach((k) => { if (data[k] !== undefined) update[k] = data[k]; });
  const user = await User.findByIdAndUpdate(id, update, { new: true }).select("-password");
  if (!user) throw { status: 404, message: "User not found" };
  return user;
};

export const deleteUser = async (id) => {
  const user = await User.findById(id);
  if (!user) throw { status: 404, message: "User not found" };
  if (user.role === "admin") throw { status: 403, message: "Cannot delete an admin account" };
  await User.findByIdAndDelete(id);
};

// ── Shops ─────────────────────────────────────────────────────
export const getShops = async ({ page = 1, limit = 10, search, status, category } = {}) => {
  const filter = {};
  if (category && category !== "all") filter.category = category;
  if (status && status !== "all") {
    if (status === "active")   { filter.isActive = true;  filter.isVerified = true;  }
    if (status === "pending")  { filter.isVerified = false; filter.isActive = true;  }
    if (status === "inactive") { filter.isActive = false; }
  }
  if (search) {
    filter.$or = [
      { name:             { $regex: search, $options: "i" } },
      { "location.city":  { $regex: search, $options: "i" } },
      { "location.address": { $regex: search, $options: "i" } },
    ];
  }
  const total = await Shop.countDocuments(filter);
  const shops = await Shop.find(filter)
    .populate("owner", "name email phone")
    .sort({ createdAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));
  return { shops, total, page: Number(page), limit: Number(limit) };
};

export const getShop = async (id) => {
  const shop = await Shop.findById(id).populate("owner", "name email phone");
  if (!shop) throw { status: 404, message: "Shop not found" };
  return shop;
};

export const addShop = async (data) => {
  if (!data.name || !data.category) throw { status: 422, message: "Name and category are required" };
  let owner = null;
  if (data.ownerEmail) {
    owner = await User.findOne({ email: data.ownerEmail.toLowerCase() });
    if (!owner) throw { status: 404, message: `No user found with email: ${data.ownerEmail}` };
  }
  const shop = await Shop.create({
    name:        data.name,
    category:    data.category,
    description: data.description ?? "",
    phone:       data.phone       ?? "",
    website:     data.website     ?? "",
    location:    data.location    ?? {},
    isVerified:  true,
    isActive:    true,
    owner:       owner?._id ?? (await User.findOne({ role: "admin" }))?._id,
  });
  return shop;
};

export const updateShop = async (id, data) => {
  const shop = await Shop.findById(id);
  if (!shop) throw { status: 404, message: "Shop not found" };
  const allowed = ["name", "category", "description", "phone", "website", "isVerified", "isActive", "location"];
  allowed.forEach((k) => { if (data[k] !== undefined) shop[k] = data[k]; });
  await shop.save();
  return shop;
};

export const deleteShop = async (id) => {
  const shop = await Shop.findById(id);
  if (!shop) throw { status: 404, message: "Shop not found" };
  await Review.deleteMany({ shop: id });
  await Shop.findByIdAndDelete(id);
};

export const approveShop = async (id) => {
  const shop = await Shop.findById(id);
  if (!shop) throw { status: 404, message: "Shop not found" };
  shop.isVerified = true;
  shop.isActive   = true;
  await shop.save();
  if (shop.owner) {
    await User.findByIdAndUpdate(shop.owner, {
      $push: { notifications: { $each: [{ type: "system", title: "Shop Approved!", body: `"${shop.name}" is now live.`, read: false }], $slice: -50, $position: 0 } },
    });
  }
  return shop;
};

export const rejectShop = async (id) => {
  const shop = await Shop.findById(id);
  if (!shop) throw { status: 404, message: "Shop not found" };
  shop.isVerified = false;
  shop.isActive   = false;
  await shop.save();
  if (shop.owner) {
    await User.findByIdAndUpdate(shop.owner, {
      $push: { notifications: { $each: [{ type: "system", title: "Shop Rejected", body: `"${shop.name}" was not approved. Contact support.`, read: false }], $slice: -50, $position: 0 } },
    });
  }
  return shop;
};

// ── Moderation (reviews) ──────────────────────────────────────
export const getReviews = async ({ page = 1, limit = 10, search, shopId } = {}) => {
  const filter = {};
  if (shopId) filter.shop = shopId;
  if (search) filter.$or = [{ text: { $regex: search, $options: "i" } }];
  const total   = await Review.countDocuments(filter);
  const reviews = await Review.find(filter)
    .populate("user", "name email")
    .populate("shop", "name category")
    .sort({ createdAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));
  return { reviews, total, page: Number(page), limit: Number(limit) };
};

export const deleteReview = async (id) => {
  const review = await Review.findById(id);
  if (review) {
    await Review.findByIdAndDelete(id);
    return;
  }
  // try embedded
  const shop = await Shop.findOne({ "reviews._id": id });
  if (!shop) throw { status: 404, message: "Review not found" };
  shop.reviews.pull(id);
  await shop.save();
};

export const toggleReviewVisibility = async (id) => {
  const review = await Review.findById(id);
  if (review) {
    review.isVisible = !review.isVisible;
    await review.save();
    return review;
  }
  const shop = await Shop.findOne({ "reviews._id": id });
  if (!shop) throw { status: 404, message: "Review not found" };
  const embedded = shop.reviews.id(id);
  embedded.isVisible = !embedded.isVisible;
  await shop.save();
  return embedded;
};

// ── Categories ────────────────────────────────────────────────
const SHOP_CATEGORIES = [
  "Restaurant","Cafe","Grocery","Clothing","Electronics",
  "Pharmacy","Salon","Gym","Bookstore","Hardware","Other",
];

export const getCategories = async () => {
  const counts = await Shop.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 }, avgRating: { $avg: "$avgRating" } } },
    { $sort:  { count: -1 } },
  ]);
  const countMap = {};
  counts.forEach((c) => { countMap[c._id] = { count: c.count, avgRating: c.avgRating }; });
  return SHOP_CATEGORIES.map((name) => ({
    name,
    count:     countMap[name]?.count     ?? 0,
    avgRating: countMap[name]?.avgRating ?? 0,
  }));
};
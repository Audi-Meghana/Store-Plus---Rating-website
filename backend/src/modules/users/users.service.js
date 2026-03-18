import mongoose from "mongoose";
import User from "./users.model.js";
import Shop from "../stores/stores.model.js";

/* ── Get full profile ────────────────────────────────────────── */
export const getProfile = async (userId) =>
  User.findById(userId)
    .select("-password -resetPasswordToken -resetPasswordExpires")
    .populate("wishlist", "name category location logo cover avgRating reviewCount isVerified isOpen");

/* ── Update profile ──────────────────────────────────────────── */
export const updateProfile = async (userId, data) => {
  const allowed = ["name", "phone", "city", "avatar", "notifPrefs"];
  const update  = {};
  allowed.forEach((k) => { if (data[k] !== undefined) update[k] = data[k]; });
  return User.findByIdAndUpdate(
    userId,
    { $set: update },
    { new: true, runValidators: true }
  ).select("-password -resetPasswordToken -resetPasswordExpires");
};

/* ── Change password ─────────────────────────────────────────── */
export const changePassword = async (userId, { currentPassword, newPassword } = {}) => {
  if (!currentPassword)
    throw { status: 400, message: "Current password is required" };
  if (!newPassword || newPassword.length < 8)
    throw { status: 422, message: "New password must be at least 8 characters" };

  const user = await User.findById(userId).select("+password");
  if (!user) throw { status: 404, message: "User not found" };

  if (!user.password)
    throw { status: 500, message: "Unable to verify password. Please contact support." };

  let isMatch;
  try {
    isMatch = await user.comparePassword(currentPassword);
  } catch (e) {
    console.error("bcrypt comparePassword error:", e);
    throw { status: 500, message: "Password verification failed" };
  }

  if (!isMatch)
    throw { status: 401, message: "Current password is incorrect" };

  user.password = newPassword;

  try {
    await user.save({ validateModifiedOnly: true });
  } catch (e) {
    console.error("user.save() error:", e);
    throw { status: 500, message: "Failed to save new password" };
  }
};

/* ── Wishlist: toggle a shop ─────────────────────────────────── */
export const toggleWishlist = async (userId, shopId) => {
  const user = await User.findById(userId);
  if (!user) throw { status: 404, message: "User not found" };

  const shop = await Shop.findById(shopId);
  if (!shop) throw { status: 404, message: "Shop not found" };

  const idx = user.wishlist.findIndex((id) => id.toString() === shopId.toString());

  if (idx > -1) {
    user.wishlist.splice(idx, 1);
  } else {
    user.wishlist.push(shopId);
  }

  await user.save();
  return {
    wishlisted:    idx === -1,
    wishlistCount: user.wishlist.length,
  };
};

/* ── Wishlist: get all saved shops ───────────────────────────── */
export const getWishlist = async (userId) => {
  const user = await User.findById(userId).populate(
    "wishlist",
    "name category location logo cover avgRating reviewCount isVerified isOpen"
  );
  return user?.wishlist || [];
};

/* ── User's own reviews ──────────────────────────────────────── */
export const getMyReviews = async (userId) => {
  // Convert to ObjectId to ensure proper MongoDB embedded doc query matching
  const userObjectId = new mongoose.Types.ObjectId(userId.toString());

  const shops = await Shop.find({ "reviews.user": userObjectId })
    .select("name category location logo reviews");

  console.log(`getMyReviews: found ${shops.length} shops for userId ${userId}`);

  const results = [];

  shops.forEach((shop) => {
    shop.reviews
      .filter((r) => r.user.toString() === userId.toString())
      .forEach((r) => {
        results.push({
          ...r.toObject(),
          shop: {
            _id:      shop._id,
            name:     shop.name,
            category: shop.category,
            location: shop.location,
            logo:     shop.logo,
          },
        });
      });
  });

  console.log(`getMyReviews: returning ${results.length} reviews`);
  return results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};
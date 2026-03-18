import fs from "fs";
import path from "path";
import Store from "./stores.model.js";
import mongoose from "mongoose";

const STORE_SELECT = "";

const uploadsDir = path.join(process.cwd(), "uploads", "shops");
fs.mkdirSync(uploadsDir, { recursive: true });

const buildFilename = (file) => {
  const hasExt = file.originalname.includes(".");
  const ext    = hasExt ? "." + file.originalname.split(".").pop() : "";
  const base   = (hasExt ? file.originalname.replace(ext, "") : file.originalname)
    .replace(/\s+/g, "-");
  const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
  return `${base}-${unique}${ext}`;
};

const saveBufferToDisk = (file) => {
  const filename = buildFilename(file);
  const filePath = path.join(uploadsDir, filename);
  fs.writeFileSync(filePath, file.buffer);
  return filename;
};

const buildImageUrl = (filename) => `/uploads/shops/${filename}`;

const deleteLocalFileIfExists = (url) => {
  if (!url || !url.startsWith("/uploads/")) return;
  const filePath = path.join(process.cwd(), url.replace("/uploads", "uploads"));
  fs.unlink(filePath, () => {});
};

// ── Shops ──────────────────────────────────────────────────────────────────────
export const getAllShops = async (query) => {
  const { sort, limit, category, search, city } = query;
  const filter = {};

  filter.$or = [{ isActive: true }, { isActive: { $exists: false } }];

  if (category) filter.category = { $regex: category, $options: "i" };
  if (city)     filter["location.city"] = { $regex: city, $options: "i" };
  if (search) {
    filter.$and = [{
      $or: [
        { name:        { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category:    { $regex: search, $options: "i" } },
      ],
    }];
  }

  let q = Store.find(filter);
  if (sort === "rating")  q = q.sort({ avgRating:   -1 });
  if (sort === "newest")  q = q.sort({ createdAt:   -1 });
  if (sort === "reviews") q = q.sort({ reviewCount: -1 });
  if (limit) q = q.limit(Number(limit));

  return await q;
};

export const getShopById = async (id) => {
  const store = await Store.findById(id);
  if (!store) {
    const e = new Error("Store not found");
    e.status = 404;
    throw e;
  }
  return store;
};

export const getMyStore = async (ownerId) => {
  let store = await Store.findOne({ owner: ownerId }).select(STORE_SELECT);
  if (!store) store = await Store.create({ owner: ownerId, name: "My Shop" });
  return store;
};

export const updateProfile = async (ownerId, payload) => {
  const { name, category, description, phone, website, instagram, facebook } = payload;
  if (!name?.trim()) {
    const e = new Error("Shop name is required");
    e.status = 400;
    throw e;
  }
  const store = await Store.findOneAndUpdate(
    { owner: ownerId },
    { name, category, description, phone, website, instagram, facebook },
    { new: true, upsert: true }
  ).select(STORE_SELECT);
  return { name: store.name, category: store.category, description: store.description,
    phone: store.phone, website: store.website, instagram: store.instagram, facebook: store.facebook };
};

export const updateLocation = async (ownerId, payload) => {
  const { address, city, state, pincode, landmark, lat, lng } = payload;
  const store = await Store.findOneAndUpdate(
    { owner: ownerId },
    { location: { address, city, state, pincode, landmark,
        lat: lat ? Number(lat) : null, lng: lng ? Number(lng) : null } },
    { new: true, upsert: true }
  ).select(STORE_SELECT);
  return store.location;
};

export const updateHours = async (ownerId, hours) => {
  const store = await Store.findOneAndUpdate(
    { owner: ownerId },
    { hours },
    { new: true, upsert: true }
  ).select(STORE_SELECT);
  return store.hours;
};

export const getOwnerStats = async (ownerId) => {
  const store = await Store.findOne({ owner: ownerId });
  if (!store) return { avgRating: 0, reviewCount: 0, profileViews: 0 };
  return { avgRating: store.avgRating, reviewCount: store.reviewCount, profileViews: store.profileViews };
};

// ── Owner reviews — reads from embedded shop.reviews[] ──────────────────────
export const getOwnerReviews = async (ownerId, query = {}) => {
  const shop = await Store.findOne({ owner: ownerId });
  if (!shop) return { reviews: [], total: 0 };

  const { page = 1, limit = 10, sort = "newest" } = query;
  let reviews = [...shop.reviews];

  if (sort === "highest") reviews.sort((a, b) => b.rating - a.rating);
  else if (sort === "lowest") reviews.sort((a, b) => a.rating - b.rating);
  else if (sort === "oldest") reviews.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  else reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const total     = reviews.length;
  const skip      = (Number(page) - 1) * Number(limit);
  const paginated = reviews.slice(skip, skip + Number(limit));

  // populate user info
  const userIds = [...new Set(paginated.map(r => r.user?.toString()).filter(Boolean))];
  const mongoose = (await import("mongoose")).default;
  const User = (await import("../auth/auth.model.js")).default;
  const users = await User.find({ _id: { $in: userIds } }).select("name avatar");
  const userMap = {};
  users.forEach(u => { userMap[u._id.toString()] = u; });

  const populated = paginated.map(r => ({
    ...r.toObject(),
    user: userMap[r.user?.toString()] ?? r.user,
  }));

  return { reviews: populated, total };
};

// kept for backwards compat but no longer used by dashboard
export const getRatingTrend     = async () => [];
export const getReviewVolume    = async () => [];
export const getRatingBreakdown = async () => [];

// ── Images ─────────────────────────────────────────────────────────────────────
export const uploadLogo = async (ownerId, file) => {
  const filename = saveBufferToDisk(file);
  const url      = buildImageUrl(filename);
  const store    = await Store.findOne({ owner: ownerId });
  if (store?.logo?.url) deleteLocalFileIfExists(store.logo.url);
  return Store.findOneAndUpdate(
    { owner: ownerId },
    { logo: { url, public_id: "" } },
    { new: true, upsert: true }
  ).select(STORE_SELECT);
};

export const uploadCover = async (ownerId, file) => {
  const filename = saveBufferToDisk(file);
  const url      = buildImageUrl(filename);
  const store    = await Store.findOne({ owner: ownerId });
  if (store?.cover?.url) deleteLocalFileIfExists(store.cover.url);
  return Store.findOneAndUpdate(
    { owner: ownerId },
    { cover: { url, public_id: "" } },
    { new: true, upsert: true }
  ).select(STORE_SELECT);
};

export const uploadGalleryImage = async (ownerId, file) => {
  const filename = saveBufferToDisk(file);
  const url      = buildImageUrl(filename);
  return Store.findOneAndUpdate(
    { owner: ownerId },
    { $push: { gallery: { url, public_id: "" } } },
    { new: true, upsert: true }
  ).select(STORE_SELECT);
};

export const deleteGalleryImage = async (ownerId, imageId) => {
  const store = await Store.findOne({ owner: ownerId });
  if (!store) { const e = new Error("Store not found"); e.status = 404; throw e; }
  const img = store.gallery.id(imageId);
  if (!img)  { const e = new Error("Image not found");  e.status = 404; throw e; }
  deleteLocalFileIfExists(img.url);
  await Store.updateOne({ owner: ownerId }, { $pull: { gallery: { _id: imageId } } });
  return Store.findOne({ owner: ownerId }).select(STORE_SELECT);
};

export const deleteImage = async (ownerId, type) => {
  const store = await Store.findOne({ owner: ownerId });
  if (!store) { const e = new Error("Store not found"); e.status = 404; throw e; }
  deleteLocalFileIfExists(store[type]?.url);
  store[type] = { url: "", public_id: "" };
  await store.save();
  return store;
};
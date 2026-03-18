import { Router } from "express";
import { protect, ownerOnly } from "../../middleware/auth.js";
import upload from "../../middleware/uploadMiddleware.js";
import {
  getAllShops, getShopById, getMyStore,
  updateProfile, updateLocation, updateHours,
  uploadLogo, uploadCover, uploadGallery,
  deleteImage, deleteGallery,
  getOwnerStats, getOwnerReviews,
} from "./stores.controller.js";
import { getShopAnalytics } from "../analytics/analytics.controller.js";

// ── Single router for everything under /api/shops ─────────────────────────────
const router = Router();

// ── Owner routes (must come BEFORE /:id wildcard) ─────────────────────────────
router.get("/me",                  protect, ownerOnly, getMyStore);
router.get("/me/analytics",        protect, ownerOnly, getShopAnalytics); // ← single endpoint for all chart data
router.get("/me/stats",            protect, ownerOnly, getOwnerStats);
router.get("/me/reviews",          protect, ownerOnly, getOwnerReviews);

router.put("/owner/profile",       protect, ownerOnly, updateProfile);
router.patch("/owner/profile",     protect, ownerOnly, updateProfile);

router.put("/owner/location",      protect, ownerOnly, updateLocation);
router.patch("/owner/location",    protect, ownerOnly, updateLocation);

router.put("/owner/hours",         protect, ownerOnly, updateHours);
router.patch("/owner/hours",       protect, ownerOnly, updateHours);

router.post("/owner/images/logo",               protect, ownerOnly, upload.single("logo"),   uploadLogo);
router.post("/owner/images/cover",              protect, ownerOnly, upload.single("cover"),  uploadCover);
router.post("/owner/images/gallery",            protect, ownerOnly, upload.single("images"), uploadGallery);
router.delete("/owner/images/gallery/:imageId", protect, ownerOnly, deleteGallery);
router.delete("/owner/images/:type",            protect, ownerOnly, deleteImage);

// ── Public routes (/:id wildcard always last) ─────────────────────────────────
router.get("/", getAllShops);
router.get("/:id", getShopById);

export default router;
import { Router }             from "express";
import { protect, ownerOnly } from "../../middleware/auth.js";
import upload                 from "../../middleware/uploadMiddleware.js";
import {
  getShopReviews,
  createReview,
  updateReview,
  deleteReview,
  toggleHelpful,
  ownerReply,
  deleteOwnerReply,
  getUserReviews,
} from "./reviews.controller.js";

// mergeParams reads :shopId when mounted at /api/shops/:shopId/reviews
const router = Router({ mergeParams: true });

// ── Shop reviews ──────────────────────────────────────────────────────────────
router.get ("/",  getShopReviews);                                              // public
router.post("/",  protect, upload.array("images", 5), createReview);            // auth

// ── Single review actions ─────────────────────────────────────────────────────
router.patch ("/:id",         protect, upload.array("images", 5), updateReview);
router.delete("/:id",         protect, deleteReview);
router.post  ("/:id/helpful", protect, toggleHelpful);

// ── Owner reply ───────────────────────────────────────────────────────────────
router.post  ("/:id/reply",   protect, ownerOnly, ownerReply);
router.delete("/:id/reply",   protect, ownerOnly, deleteOwnerReply);

// ── User's own reviews ────────────────────────────────────────────────────────
router.get("/user/me", protect, getUserReviews);

export default router;
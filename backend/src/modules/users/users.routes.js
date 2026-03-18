import { Router }  from "express";
import { protect } from "../../middleware/auth.js";
import {
  getProfile,
  updateProfile,
  changePassword,
  getWishlist,
  toggleWishlist,
  getMyReviews,
} from "./users.controller.js";

const router = Router();

// All user routes require authentication
router.use(protect);

router.get   ("/me",                  getProfile);      // GET   /api/users/me
router.patch ("/me",                  updateProfile);   // PATCH /api/users/me
router.patch ("/me/password",         changePassword);  // PATCH /api/users/me/password
router.get   ("/me/wishlist",         getWishlist);     // GET   /api/users/me/wishlist
router.post  ("/me/wishlist/:shopId", toggleWishlist);  // POST  /api/users/me/wishlist/:shopId
router.get   ("/me/reviews",          getMyReviews);    // GET   /api/users/me/reviews

export default router;
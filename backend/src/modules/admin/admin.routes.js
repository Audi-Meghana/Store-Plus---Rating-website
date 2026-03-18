import { Router }              from "express";
import { protect, adminOnly }  from "../../middleware/auth.js";
import {
  getDashboardStats,
  getUsers, getUser, updateUser, deleteUser,
  getShops, getShop, addShop, updateShop, deleteShop, approveShop, rejectShop,
  getReviews, deleteReview, toggleReviewVisibility,
  getCategories,
} from "./admin.controller.js";

const router = Router();
router.use(protect, adminOnly); // all routes require admin

// Dashboard
router.get("/dashboard", getDashboardStats);

// Users
router.get   ("/users",     getUsers);
router.get   ("/users/:id", getUser);
router.patch ("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

// Shops
router.get   ("/shops",            getShops);
router.get   ("/shops/:id",        getShop);
router.post  ("/shops",            addShop);
router.patch ("/shops/:id",        updateShop);
router.delete("/shops/:id",        deleteShop);
router.patch ("/shops/:id/approve",approveShop);
router.patch ("/shops/:id/reject", rejectShop);

// Moderation
router.get   ("/reviews",              getReviews);
router.delete("/reviews/:id",          deleteReview);
router.patch ("/reviews/:id/visibility", toggleReviewVisibility);

// Categories
router.get("/categories", getCategories);

export default router;
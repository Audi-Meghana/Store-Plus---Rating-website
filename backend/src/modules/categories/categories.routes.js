import { Router }             from "express";
import { protect, adminOnly } from "../../middleware/auth.js";
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  seedCategories,
} from "./categories.controller.js";

const router = Router();

// Public
router.get("/",          getCategories);   // ?all=true to include inactive
router.get("/:id",       getCategory);

// Admin only
router.post  ("/",        protect, adminOnly, createCategory);
router.patch ("/:id",     protect, adminOnly, updateCategory);
router.delete("/:id",     protect, adminOnly, deleteCategory);
router.post  ("/seed",    protect, adminOnly, seedCategories); // seed defaults

export default router;
import express from "express";
import { getShopAnalytics } from "../modules/stores/analytics.controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Get analytics for logged-in shop owner
router.get("/analytics", authMiddleware, getShopAnalytics);

export default router;
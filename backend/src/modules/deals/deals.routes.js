import { Router }               from "express";
import { protect, ownerOnly } from "../../middleware/auth.js";
import {
  getOwnerDeals,
  createDeal,
  updateDeal,
  deleteDeal,
  getAllActiveDeals,
  getPublicDealsForShop,
} from "./deals.controller.js";

const router = Router();

// ── Public routes (no auth) ───────────────────────────────────
// GET /api/deals/public          — deals browsing page (user side)
// GET /api/deals/shop/:shopId    — deals on store detail page
router.get("/public",          getAllActiveDeals);
router.get("/shop/:shopId",    getPublicDealsForShop);

// ── Owner routes (auth + shop_owner) ─────────────────────────
// GET    /api/deals      — DealsManagerPage fetches this on load
// POST   /api/deals      — create new deal
// PUT    /api/deals/:id  — update / toggle active
// DELETE /api/deals/:id  — delete
router.get   ("/",    protect, ownerOnly, getOwnerDeals);
router.post  ("/",    protect, ownerOnly, createDeal);
router.put   ("/:id", protect, ownerOnly, updateDeal);
router.delete("/:id", protect, ownerOnly, deleteDeal);

export default router;
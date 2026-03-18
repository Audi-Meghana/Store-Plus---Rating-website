import * as svc from "./users.service.js";

const ok  = (res, data, status = 200) => res.status(status).json({ success: true, ...data });
const err = (res, e) => res.status(e.status || 500).json({ success: false, message: e.message || "Server error" });

/* ── Profile ─────────────────────────────────────────────────── */
export const getProfile = async (req, res) => {
  try {
    const user = await svc.getProfile(req.user._id);
    ok(res, { user });
  } catch (e) { err(res, e); }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await svc.updateProfile(req.user._id, req.body);
    ok(res, { user });
  } catch (e) { err(res, e); }
};

export const changePassword = async (req, res) => {
  try {
    await svc.changePassword(req.user._id, req.body);
    ok(res, { message: "Password changed successfully" });
  } catch (e) { err(res, e); }
};

/* ── Wishlist ─────────────────────────────────────────────────── */
export const getWishlist = async (req, res) => {
  try {
    const wishlist = await svc.getWishlist(req.user._id);
    ok(res, { wishlist });
  } catch (e) { err(res, e); }
};

export const toggleWishlist = async (req, res) => {
  try {
    const result = await svc.toggleWishlist(req.user._id, req.params.shopId);
    ok(res, result);
  } catch (e) { err(res, e); }
};

/* ── Reviews ─────────────────────────────────────────────────── */
export const getMyReviews = async (req, res) => {
  try {
    const reviews = await svc.getMyReviews(req.user._id);
    ok(res, { reviews });
  } catch (e) { err(res, e); }
};
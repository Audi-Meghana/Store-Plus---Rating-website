import * as svc from "./stores.service.js";

const ok  = (res, data, status = 200) => res.status(status).json({ success: true, data });
const err = (res, e) => res.status(e.status || 500).json({ success: false, message: e.message || "Server error" });

// ── Public ────────────────────────────────────────────────────────────────────
export const getAllShops = async (req, res) => {
  try { ok(res, await svc.getAllShops(req.query)); }
  catch (e) { err(res, e); }
};

export const getShopById = async (req, res) => {
  try { ok(res, await svc.getShopById(req.params.id)); }
  catch (e) { err(res, e); }
};

// ── Owner — shop info ─────────────────────────────────────────────────────────
export const getMyStore = async (req, res) => {
  try { ok(res, await svc.getMyStore(req.user._id)); }
  catch (e) { err(res, e); }
};

export const updateProfile = async (req, res) => {
  try { ok(res, await svc.updateProfile(req.user._id, req.body)); }
  catch (e) { err(res, e); }
};

export const updateLocation = async (req, res) => {
  try { ok(res, await svc.updateLocation(req.user._id, req.body)); }
  catch (e) { err(res, e); }
};

export const updateHours = async (req, res) => {
  try { ok(res, await svc.updateHours(req.user._id, req.body)); }
  catch (e) { err(res, e); }
};

// ── Owner — stats & reviews ───────────────────────────────────────────────────
export const getOwnerStats = async (req, res) => {
  try { ok(res, await svc.getOwnerStats(req.user._id)); }
  catch (e) { err(res, e); }
};

export const getOwnerReviews = async (req, res) => {
  try { ok(res, await svc.getOwnerReviews(req.user._id, req.query)); }
  catch (e) { err(res, e); }
};

// ── Owner — images ────────────────────────────────────────────────────────────
export const uploadLogo = async (req, res) => {
  try {
    if (!req.file) return err(res, { status: 400, message: "Logo file is required" });
    ok(res, await svc.uploadLogo(req.user._id, req.file));
  } catch (e) {
    console.error("UPLOAD LOGO ERROR:", e);
    err(res, e);
  }
};

export const uploadCover = async (req, res) => {
  try {
    if (!req.file) return err(res, { status: 400, message: "Cover file is required" });
    ok(res, await svc.uploadCover(req.user._id, req.file));
  } catch (e) {
    console.error("UPLOAD COVER ERROR:", e);
    err(res, e);
  }
};

export const uploadGallery = async (req, res) => {
  try {
    if (!req.file) return err(res, { status: 400, message: "Gallery image is required" });
    ok(res, await svc.uploadGalleryImage(req.user._id, req.file));
  } catch (e) {
    console.error("UPLOAD GALLERY ERROR:", e);
    err(res, e);
  }
};

export const deleteGallery = async (req, res) => {
  try {
    ok(res, await svc.deleteGalleryImage(req.user._id, req.params.imageId));
  } catch (e) {
    console.error("DELETE GALLERY ERROR:", e);
    err(res, e);
  }
};

export const deleteImage = async (req, res) => {
  try {
    const { type } = req.params;
    if (!["logo", "cover"].includes(type)) {
      return err(res, { status: 400, message: "Invalid type. Must be logo or cover" });
    }
    ok(res, await svc.deleteImage(req.user._id, type));
  } catch (e) {
    console.error("DELETE IMAGE ERROR:", e);
    err(res, e);
  }
};
import * as svc from "./deals.service.js";

const ok  = (res, data, status = 200) => res.status(status).json({ success: true, data });
const err = (res, e) => res.status(e.status || 500).json({ success: false, message: e.message || "Server error" });

export const getOwnerDeals = async (req, res) => {
  try { ok(res, await svc.getOwnerDeals(req.user._id)); }
  catch (e) { err(res, e); }
};

export const createDeal = async (req, res) => {
  try { ok(res, await svc.createDeal(req.user._id, req.body), 201); }
  catch (e) { err(res, e); }
};

export const updateDeal = async (req, res) => {
  try { ok(res, await svc.updateDeal(req.user._id, req.params.id, req.body)); }
  catch (e) { err(res, e); }
};

export const deleteDeal = async (req, res) => {
  try { await svc.deleteDeal(req.user._id, req.params.id); ok(res, {}); }
  catch (e) { err(res, e); }
};

export const getAllActiveDeals = async (req, res) => {
  try { ok(res, await svc.getAllActiveDeals(req.query)); }
  catch (e) { err(res, e); }
};

export const getPublicDealsForShop = async (req, res) => {
  try { ok(res, await svc.getPublicDealsForShop(req.params.shopId)); }
  catch (e) { err(res, e); }
};
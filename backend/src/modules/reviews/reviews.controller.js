import * as svc from "./reviews.service.js";

const ok  = (res, data, status = 200) => res.status(status).json({ success: true, ...data });
const err = (res, e)                  => res.status(e.status || 500).json({ success: false, message: e.message || "Server error" });

export const getShopReviews   = async (req, res) => { try { ok(res, await svc.getShopReviews(req.params.shopId, req.query));                                              } catch(e){ err(res,e); } };
// ── FIX: pass req.files so the service can save uploaded image paths ──────────
export const createReview     = async (req, res) => { try { ok(res, { review: await svc.createReview(req.user._id, req.params.shopId, req.body, req.files ?? []) }, 201); } catch(e){ err(res,e); } };
export const updateReview     = async (req, res) => { try { ok(res, { review: await svc.updateReview(req.user._id, req.params.id, req.body, req.files ?? []) });          } catch(e){ err(res,e); } };
export const deleteReview     = async (req, res) => { try { await svc.deleteReview(req.user._id, req.params.id); ok(res, {});                                              } catch(e){ err(res,e); } };
export const toggleHelpful    = async (req, res) => { try { ok(res, await svc.toggleHelpful(req.user._id, req.params.id));                                                } catch(e){ err(res,e); } };
export const ownerReply       = async (req, res) => { try { ok(res, { review: await svc.ownerReply(req.user._id, req.params.id, req.body.text) });                        } catch(e){ err(res,e); } };
export const deleteOwnerReply = async (req, res) => { try { await svc.deleteOwnerReply(req.user._id, req.params.id); ok(res, {});                                         } catch(e){ err(res,e); } };
export const getUserReviews   = async (req, res) => { try { ok(res, { reviews: await svc.getUserReviews(req.user._id) });                                                 } catch(e){ err(res,e); } };
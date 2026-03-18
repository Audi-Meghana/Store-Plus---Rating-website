import * as svc from "./admin.service.js";

const ok  = (res, data, status = 200) => res.status(status).json({ success: true, ...data });
const err = (res, e)                  => res.status(e.status || 500).json({ success: false, message: e.message || "Server error" });

// Dashboard
export const getDashboardStats = async (req, res) => { try { ok(res, await svc.getDashboardStats()); } catch(e){ err(res,e); } };

// Users
export const getUsers   = async (req, res) => { try { ok(res, await svc.getUsers(req.query));                          } catch(e){ err(res,e); } };
export const getUser    = async (req, res) => { try { ok(res, { user: await svc.getUser(req.params.id) });             } catch(e){ err(res,e); } };
export const updateUser = async (req, res) => { try { ok(res, { user: await svc.updateUser(req.params.id, req.body) });} catch(e){ err(res,e); } };
export const deleteUser = async (req, res) => { try { await svc.deleteUser(req.params.id); ok(res, {});                } catch(e){ err(res,e); } };

// Shops
export const getShops    = async (req, res) => { try { ok(res, await svc.getShops(req.query));                           } catch(e){ err(res,e); } };
export const getShop     = async (req, res) => { try { ok(res, { shop: await svc.getShop(req.params.id) });              } catch(e){ err(res,e); } };
export const addShop     = async (req, res) => { try { ok(res, { shop: await svc.addShop(req.body) }, 201);              } catch(e){ err(res,e); } };
export const updateShop  = async (req, res) => { try { ok(res, { shop: await svc.updateShop(req.params.id, req.body) }); } catch(e){ err(res,e); } };
export const deleteShop  = async (req, res) => { try { await svc.deleteShop(req.params.id); ok(res, {});                 } catch(e){ err(res,e); } };
export const approveShop = async (req, res) => { try { ok(res, { shop: await svc.approveShop(req.params.id) });          } catch(e){ err(res,e); } };
export const rejectShop  = async (req, res) => { try { ok(res, { shop: await svc.rejectShop(req.params.id) });           } catch(e){ err(res,e); } };

// Moderation
export const getReviews             = async (req, res) => { try { ok(res, await svc.getReviews(req.query));                           } catch(e){ err(res,e); } };
export const deleteReview           = async (req, res) => { try { await svc.deleteReview(req.params.id); ok(res, {});                 } catch(e){ err(res,e); } };
export const toggleReviewVisibility = async (req, res) => { try { ok(res, { review: await svc.toggleReviewVisibility(req.params.id) });} catch(e){ err(res,e); } };

// Categories
export const getCategories = async (req, res) => { try { ok(res, { categories: await svc.getCategories() }); } catch(e){ err(res,e); } };
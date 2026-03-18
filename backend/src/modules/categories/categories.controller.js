import * as svc from "./categories.service.js";

const ok  = (res, data, status = 200) => res.status(status).json({ success: true, ...data });
const err = (res, e)                  => res.status(e.status || 500).json({ success: false, message: e.message || "Server error" });

export const getCategories   = async (req, res) => { try { ok(res, { categories: await svc.getCategories({ includeInactive: req.query.all === "true" }) }); } catch(e){ err(res,e); } };
export const getCategory     = async (req, res) => { try { ok(res, { category: await svc.getCategory(req.params.id) });                                      } catch(e){ err(res,e); } };
export const createCategory  = async (req, res) => { try { ok(res, { category: await svc.createCategory(req.body) }, 201);                                   } catch(e){ err(res,e); } };
export const updateCategory  = async (req, res) => { try { ok(res, { category: await svc.updateCategory(req.params.id, req.body) });                         } catch(e){ err(res,e); } };
export const deleteCategory  = async (req, res) => { try { await svc.deleteCategory(req.params.id); ok(res, {});                                             } catch(e){ err(res,e); } };
export const seedCategories  = async (req, res) => { try { ok(res, { categories: await svc.seedCategories() });                                              } catch(e){ err(res,e); } };
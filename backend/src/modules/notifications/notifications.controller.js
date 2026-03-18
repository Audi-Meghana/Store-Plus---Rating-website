import * as svc from "./notifications.service.js";

const ok  = (res, data) => res.status(200).json({ success: true, data });
const err = (res, e)    => res.status(e.status || 500).json({ success: false, message: e.message || "Server error" });

export const getMyNotifications = async (req, res) => {
  try { ok(res, await svc.getMyNotifications(req.user._id)); }
  catch (e) { err(res, e); }
};

export const markRead = async (req, res) => {
  try { await svc.markRead(req.user._id, req.params.id); ok(res, {}); }
  catch (e) { err(res, e); }
};

export const deleteOne = async (req, res) => {
  try { await svc.deleteNotification(req.user._id, req.params.id); ok(res, {}); }
  catch (e) { err(res, e); }
};

export const unreadCount = async (req, res) => {
  try { ok(res, { count: await svc.unreadCount(req.user._id) }); }
  catch (e) { err(res, e); }
};
import { Router } from "express";
import { protect } from "../../middleware/auth.js";
import {
  getMyNotifications,
  markRead,
  deleteOne,
  unreadCount,
} from "./notifications.controller.js";

const router = Router();

// All notification routes require authentication
router.use(protect);

router.get   ("/",              getMyNotifications);  // GET  /api/notifications
router.get   ("/unread-count",  unreadCount);         // GET  /api/notifications/unread-count
router.patch ("/:id/read",      markRead);            // PATCH /api/notifications/:id/read  (or "all")
router.delete("/:id",           deleteOne);           // DELETE /api/notifications/:id

export default router;
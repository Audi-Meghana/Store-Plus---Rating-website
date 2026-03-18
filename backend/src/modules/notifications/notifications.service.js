import User from "../auth/auth.model.js";

// ── Create a notification (called internally from reviews, deals etc) ──────────
export const createNotification = async (userId, { type, title, body, store, review }) => {
  await User.findByIdAndUpdate(userId, {
    $push: {
      notifications: {
        $each: [{ type, title, body: body ?? "", store, review, read: false }],
        $slice: -50, // keep only latest 50
        $position: 0,
      },
    },
  });
};

// ── Get all notifications for a user ──────────────────────────────────────────
export const getMyNotifications = async (userId) => {
  const user = await User.findById(userId).select("notifications");
  return user?.notifications ?? [];
};

// ── Mark one or all as read ───────────────────────────────────────────────────
export const markRead = async (userId, id) => {
  if (id === "all") {
    await User.updateOne(
      { _id: userId },
      { $set: { "notifications.$[].read": true } }
    );
  } else {
    await User.updateOne(
      { _id: userId, "notifications._id": id },
      { $set: { "notifications.$.read": true } }
    );
  }
};

// ── Delete one notification ───────────────────────────────────────────────────
export const deleteNotification = async (userId, id) => {
  await User.updateOne(
    { _id: userId },
    { $pull: { notifications: { _id: id } } }
  );
};

// ── Unread count ──────────────────────────────────────────────────────────────
export const unreadCount = async (userId) => {
  const user = await User.findById(userId).select("notifications");
  return user?.notifications?.filter((n) => !n.read).length ?? 0;
};
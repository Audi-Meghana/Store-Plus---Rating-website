import User from "./auth.model.js";
import "../stores/stores.model.js";

// Get user by ID
export const findUserById = (id) => User.findById(id);

// Get user by email
export const findUserByEmail = (email) =>
  User.findOne({ email: email.toLowerCase() });

// Update name / phone / avatar
export const updateAccount = async (userId, { name, phone, avatar }) => {
  const update = {};
  if (name   !== undefined) update.name   = name.trim();
  if (phone  !== undefined) update.phone  = phone;
  if (avatar !== undefined) update.avatar = avatar;

  return User.findByIdAndUpdate(userId, { $set: update }, { new: true, runValidators: true });
};

// Change password (requires current password check)
export const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId).select("+password");
  if (!user) throw new Error("User not found.");

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) throw new Error("Current password is incorrect.");

  user.password = newPassword;
  await user.save();
  return user;
};

// Save notification preferences
export const updateNotifPrefs = async (userId, prefs) => {
  const allowed = [
    "newReview", "replyReceived", "dealExpiry",
    "weeklyReport", "tipAlerts", "marketing",
  ];
  const update = {};
  allowed.forEach((key) => {
    if (prefs[key] !== undefined)
      update[`notifPrefs.${key}`] = Boolean(prefs[key]);
  });

  return User.findByIdAndUpdate(userId, { $set: update }, { new: true });
};
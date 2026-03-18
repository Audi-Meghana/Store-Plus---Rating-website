// auth.validator.js
// Provides simple request validation schema + middleware used by auth.routes.js

const isEmail = (value) =>
  typeof value === "string" && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value);

export const registerSchema = (data) => {
  if (!data.name || data.name.trim().length < 2) return "Name must be at least 2 characters.";
  if (!data.email || !isEmail(data.email)) return "Valid email is required.";
  if (!data.password || data.password.length < 6) return "Password must be at least 6 characters.";
  if (data.role && !["user", "shop_owner", "admin"].includes(data.role))
    return "Invalid role.";
  return null;
};

export const loginSchema = (data) => {
  if (!data.email || !isEmail(data.email)) return "Valid email is required.";
  if (!data.password || data.password.length < 6) return "Password is required.";
  return null;
};

export const forgotPasswordSchema = (data) => {
  if (!data.email || !isEmail(data.email)) return "Valid email is required.";
  return null;
};

export const resetPasswordSchema = (data) => {
  if (!data.token || typeof data.token !== "string") return "Reset token is required.";
  if (!data.newPassword || data.newPassword.length < 6)
    return "New password must be at least 6 characters.";
  return null;
};

export const validate = (fn) => (req, res, next) => {
  const error = fn(req.body);
  if (error) {
    return res.status(422).json({ success: false, message: error });
  }
  next();
};
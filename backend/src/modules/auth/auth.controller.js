import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "./auth.model.js";
import Shop from "../stores/stores.model.js";
import { sendWelcomeEmail, sendPasswordResetEmail } from "../../utils/emailService.js";

// ── Token helpers ─────────────────────────────────────────────────────────────

const signAccess = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRY || "15m",
  });

const signRefresh = (id) =>
  jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRY || "7d",
  });

const attachCookieAndRespond = (res, user, statusCode, message) => {
  const accessToken  = signAccess(user._id, user.role);
  const refreshToken = signRefresh(user._id);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge:   7 * 24 * 60 * 60 * 1000,
  });

  return res.status(statusCode).json({
    success: true,
    message,
    data: { user, accessToken },
  });
};

// ── POST /api/auth/register ───────────────────────────────────────────────────
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role = "user", shopName } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const user = await User.create({
      name:     name.trim(),
      email:    email.toLowerCase(),
      password,
      role,
    });

    if (role === "shop_owner") {
      const resolvedShopName = shopName?.trim() || `${name.trim()} Shop`;
      await Shop.create({ owner: user._id, name: resolvedShopName });
    }

    sendWelcomeEmail(user).catch(() => {});

    return attachCookieAndRespond(res, user, 201, "Account created successfully.");
  } catch (err) {
    next(err);
  }
};

// ── POST /api/auth/login ──────────────────────────────────────────────────────
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    return attachCookieAndRespond(res, user, 200, "Login successful.");
  } catch (err) {
    next(err);
  }
};

// ── POST /api/auth/refresh ────────────────────────────────────────────────────
export const refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No refresh token. Please log in.",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please log in again.",
        code:    "REFRESH_EXPIRED",
      });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found.",
      });
    }

    const accessToken = signAccess(user._id, user.role);
    return res.status(200).json({
      success: true,
      message: "Token refreshed.",
      data:    { accessToken },
    });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/auth/logout ─────────────────────────────────────────────────────
export const logout = async (req, res, next) => {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/auth/forgot-password ───────────────────────────────────────────
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      const rawToken    = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

      user.resetPasswordToken   = hashedToken;
      user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
      await user.save({ validateBeforeSave: false });

      const clientUrl = req.headers.origin || process.env.CLIENT_URL;
      const resetUrl  = `${clientUrl}/reset-password/${rawToken}`;

      await sendPasswordResetEmail(user, resetUrl).catch(() => {});
    }

    return res.status(200).json({
      success: true,
      message: "If that email is registered, a reset link has been sent.",
    });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/auth/reset-password ────────────────────────────────────────────
export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken:   hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select("+password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Reset link is invalid or has expired.",
      });
    }

    user.password             = newPassword;
    user.resetPasswordToken   = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return attachCookieAndRespond(res, user, 200, "Password reset successful.");
  } catch (err) {
    next(err);
  }
};
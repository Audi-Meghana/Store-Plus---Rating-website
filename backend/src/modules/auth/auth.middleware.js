import jwt from "jsonwebtoken";
import User from "./auth.model.js";

// ── protect — verify Bearer token, attach req.user ───────────────────────────
export const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not authorised. Please log in.",
      });
    }

    const token = header.split(" ")[1];

    let decoded;
    try {
      // eslint-disable-next-line no-undef
      decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Session expired. Please log in again.",
          code: "TOKEN_EXPIRED",
        });
      }
      return res.status(401).json({
        success: false,
        message: "Invalid token. Please log in again.",
        code: "INVALID_TOKEN",
      });
    }

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Account no longer exists.",
      });
    }

    req.user = user;
    next();

  } catch (err) {
    next(err);
  }
};

// ── restrictTo — generic role gate ───────────────────────────────────────────
export const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return res.status(403).json({
      success: false,
      message: `Access denied. Required role: ${roles.join(" or ")}.`,
    });
  }
  next();
};

// ── ownerOnly — shop_owner role gate ─────────────────────────────────────────
export const ownerOnly = (req, res, next) => {
  if (req.user?.role !== "shop_owner") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Shop owners only.",
    });
  }
  next();
};

// ── adminOnly — admin role gate ───────────────────────────────────────────────
export const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admins only.",
    });
  }
  next();
};
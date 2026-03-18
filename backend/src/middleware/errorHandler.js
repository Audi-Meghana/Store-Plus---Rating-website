import logger from "../utils/logger.js";

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  // ADD THESE TWO LINES:
  console.error("FULL ERROR:", err);
  console.error("STACK:", err.stack);

  logger.error(`${req.method} ${req.originalUrl} — ${err.message}`);

  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(422).json({ success: false, message: messages[0], errors: messages });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ success: false, message: `${field} already exists.` });
  }
  if (err.name === "CastError")
    return res.status(400).json({ success: false, message: "Invalid ID format." });
  if (err.name === "JsonWebTokenError")
    return res.status(401).json({ success: false, message: "Invalid token." });
  if (err.name === "TokenExpiredError")
    return res.status(401).json({ success: false, message: "Token expired." });
  if (err.code === "LIMIT_FILE_SIZE")
    return res.status(400).json({ success: false, message: "File too large. Max 5MB allowed." });

  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal server error.",
  });
};

export default errorHandler;
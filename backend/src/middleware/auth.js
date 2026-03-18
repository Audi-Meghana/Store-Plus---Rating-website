/**
 * middleware/auth.js
 * Place at: backend/src/middleware/auth.js
 *
 * Re-exports from the actual auth middleware using the correct named exports.
 * Your auth.middleware.js exports: protect, restrictTo, ownerOnly, adminOnly
 */
export { protect, restrictTo as requireRole, ownerOnly, adminOnly }
  from "../modules/auth/auth.middleware.js";
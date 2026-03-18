import { error } from "../utils/apiResponse.js";

export const roleGuard = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return error(res, "Not authenticated", 401);
    }
    if (!allowedRoles.includes(req.user.role)) {
      return error(res, "You do not have permission to do this", 403);
    }
    next();
  };
};
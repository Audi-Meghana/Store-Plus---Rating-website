// auth.routes.js
import { Router } from "express";
import * as authController from "./auth.controller.js";
// eslint-disable-next-line no-unused-vars
import { protect, restrictTo } from "./auth.middleware.js";
import {
  validate,
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./auth.validator.js";

const router = Router();

router.post("/register",        validate(registerSchema),       authController.register);
router.post("/login",           validate(loginSchema),          authController.login);
router.post("/refresh",                                         authController.refresh);
router.post("/logout",          protect,                        authController.logout);
router.post("/forgot-password", validate(forgotPasswordSchema), authController.forgotPassword);
router.post("/reset-password",  validate(resetPasswordSchema),  authController.resetPassword);

// Example protected + role-restricted route
// router.get("/admin", protect, restrictTo("admin"), authController.adminOnly);

export default router;
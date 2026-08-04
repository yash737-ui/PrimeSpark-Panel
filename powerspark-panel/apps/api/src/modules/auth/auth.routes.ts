import { Router } from "express";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "@powerspark/types";
import { validate } from "../../middleware/validate";
import { authenticate } from "../../middleware/authenticate";
import * as authController from "./auth.controller";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/logout", authController.logout);
router.post("/refresh", authController.refresh);
router.post("/forgot-password", validate(forgotPasswordSchema), authController.forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), authController.resetPassword);
router.post("/verify-email", validate(verifyEmailSchema), authController.verifyEmailHandler);

// Example of an authenticated route, proving the middleware/RBAC chain
// works end-to-end. No dashboard or profile-editing logic lives here.
router.get("/me", authenticate, authController.me);

export default router;

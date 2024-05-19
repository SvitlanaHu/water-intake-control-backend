import express from "express";
import { upload } from "../config/multerConfig.js";
import {
  register,
  login,
  logout,
  currentUser,
  updateSubscription,
  updateUser,
  patchAvatar,
  verifyEmail,
  resendVerificationEmail,
  countUniqueUsers,
  refreshUserTokens,
  requestPasswordReset,
  resetPassword
} from "../controllers/usersControllers.js";
import authenticate from "../middleware/authenticate.js";
import validateBody from "../helpers/validateBody.js";
import checkKey from "../middleware/checkKey.js";
import {
  userRegisterSchema,
  updateSubscriptionSchema,
  resendVerificationSchema,
  refreshTokenSchema,
  updateUserSchema,
  requestPasswordResetSchema,
  resetPasswordSchema
} from "../schemas/userSchemas.js";

const usersRouter = express.Router();

usersRouter.post("/register", validateBody(userRegisterSchema), register);
usersRouter.post("/login", validateBody(userRegisterSchema), login);
usersRouter.post("/logout", authenticate, logout);
usersRouter.patch("/update/:id", authenticate, validateBody(updateUserSchema), updateUser);
usersRouter.get('/total', countUniqueUsers);
usersRouter.get("/current", authenticate, currentUser);
usersRouter.patch(
  "/subscription",
  authenticate,
  checkKey,
  validateBody(updateSubscriptionSchema),
  updateSubscription
);
usersRouter.patch(
  "/avatars",
  authenticate,
  upload.single("avatar"),
  patchAvatar
);

usersRouter.get("/verify/:verificationToken", verifyEmail);

usersRouter.post(
  "/verify/resend",
  validateBody(resendVerificationSchema),
  resendVerificationEmail
);
usersRouter.post("/refresh-tokens", validateBody(refreshTokenSchema), refreshUserTokens);
usersRouter.post("/password-reset-request", validateBody(requestPasswordResetSchema), requestPasswordReset);
usersRouter.post("/password-reset", validateBody(resetPasswordSchema), resetPassword);

export default usersRouter;

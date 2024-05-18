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
  refreshUserTokens,
} from "../controllers/usersControllers.js";
import authenticate from "../middleware/authenticate.js";
import validateBody from "../helpers/validateBody.js";
import {
  userRegisterSchema,
  updateSubscriptionSchema,
  resendVerificationSchema,
  refreshTokenSchema,
  updateUserSchema,
} from "../schemas/userSchemas.js";

const usersRouter = express.Router();

usersRouter.post("/register", validateBody(userRegisterSchema), register);
usersRouter.post("/login", validateBody(userRegisterSchema), login);
usersRouter.post("/logout", authenticate, logout);
usersRouter.patch(
  "/update/:id",
  authenticate,
  validateBody(updateUserSchema),
  updateUser
);
usersRouter.get("/current", authenticate, currentUser);
usersRouter.patch(
  "/subscription",
  authenticate,
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
usersRouter.post("/refresh-tokens", authenticate, validateBody(refreshTokenSchema), refreshUserTokens);

export default usersRouter;

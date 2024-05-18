import express from "express";
import { upload } from "../config/multerConfig.js";
import {
  register,
  login,
  logout,
  currentUser,
  updateSubscription,
  patchAvatar,
  verifyEmail,
  resendVerificationEmail,
  updateUserProfile,
  resetPassword,
} from "../controllers/usersControllers.js";
import authenticate from "../middleware/authenticate.js";
import validateBody from "../helpers/validateBody.js";

// import { updateUser } from '../controllers/usersControllers.js';
import { newPassword, updateUserSchema } from '../schemas/userSchemas.js';
import {
  userRegisterSchema,
  updateSubscriptionSchema,
  resendVerificationSchema,
} from "../schemas/userSchemas.js";
import { protect } from "../middleware/authMiddlewares.js";

const usersRouter = express.Router();

usersRouter.post("/register", validateBody(userRegisterSchema), register);

usersRouter.post("/login", validateBody(userRegisterSchema), login);

usersRouter.post("/logout", authenticate, logout);

usersRouter.patch(
  "/update/:id",
  protect,
  validateBody(updateUserSchema),
  updateUserProfile
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

usersRouter.post("/restore-password/:otp", validateBody(newPassword), resetPassword)

usersRouter.get("/verify/:verificationToken", verifyEmail);

usersRouter.post(
  "/verify/resend",
  validateBody(resendVerificationSchema),
  resendVerificationEmail
);

export default usersRouter;

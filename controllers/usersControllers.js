import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  updateUserSubscription,
  updateUserDetails,
  refreshTokens,
  getTotalUsers,
  verifyEmailService,
  uploadAvatar,
  requestPasswordResetService,
  resetPasswordService,
  validateResetTokenService,
  resendVerificationEmailService
} from "../services/userServices.js";
import User from "../models/User.js";
import sgMail from "@sendgrid/mail";
import jwt from "jsonwebtoken";

export const register = async (req, res, next) => {
  try {
    const { email, password, timezone } = req.body;
    const host = req.headers.host;
    const nickname = email.split('@')[0];
    const user = await registerUser({ email, password, timezone, nickname }, host);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { token, refreshToken, user } = await loginUser(req.body);
    res.json({ token, refreshToken, user });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    await logoutUser(req.user);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const updateData = req.body;
    const host = req.get('host');

    const updatedUser = await updateUserDetails(userId, updateData, host);
    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
};

export const currentUser = async (req, res, next) => {
  try {
    const userData = await getCurrentUser(req.user);
    res.status(200).json(userData);
  } catch (error) {
    next(error);
  }
};

export const updateSubscription = async (req, res, next) => {
  try {
    const user = await updateUserSubscription(
      req.user._id,
      req.body.subscription
    );
    res.json({ subscription: user.subscription });
  } catch (error) {
    next(error);
  }
};

export const patchAvatar = async (req, res, next) => {
  try {
    const avatarURL = await uploadAvatar(req.user._id, req.file);
    res.status(200).json({ avatarURL });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { verificationToken } = req.params;
    const { token, refreshToken } = await verifyEmailService(verificationToken);

    if (!token || !refreshToken) {
      return res.status(404).json({ message: "User not found" });
    }

    // Redirect to frontend with tokens
    const redirectUrl = `https://${process.env.FRONTEND_URL}/verify?token=${token}&refreshToken=${refreshToken}`;
    res.redirect(redirectUrl);
  } catch (error) {
    next(error);
  }
};

export const resendVerificationEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    const host = req.get('host');
    await resendVerificationEmailService(email, host);
    res.status(200).json({ message: 'Verification email resent' });
  } catch (error) {
    next(error);
  }
};

export const refreshUserTokens = async (req, res, next) => {
  try {
    const { refreshToken: providedRefreshToken } = req.body;
    const decoded = jwt.verify(providedRefreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || user.refreshToken !== providedRefreshToken) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const { token, refreshToken } = await refreshTokens(user, providedRefreshToken);
    res.json({ token, refreshToken });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }
    next(error);
  }
};

export const countUniqueUsers = async (req, res) => {
  try {
    const result = await getTotalUsers();
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;
    await requestPasswordResetService(email, req.headers.host);
    res.status(200).json({ message: "Password reset link sent" });
  } catch (error) {
    next(error);
  }
};

export const validateResetToken = async (req, res, next) => {
  try {
    const { token } = req.params;
    const isValid = await validateResetTokenService(token);

    if (isValid) {
      const redirectUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
      res.redirect(redirectUrl);
    } else {
      res.status(400).json({ message: "Invalid or expired token" });
    }
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    const resetSuccess = await resetPasswordService(token, newPassword);

    if (resetSuccess) {
      res.status(200).json({ message: "Password reset successful" });
    } else {
      res.status(400).json({ message: "Invalid or expired token" });
    }
  } catch (error) {
    next(error);
  }
};
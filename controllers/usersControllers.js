import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  updateUserSubscription,
  updateUserDetails,
  refreshTokens,
} from "../services/userServices.js";
import User from "../models/User.js";
import fs from "fs/promises";
import path from "path";
import jimp from "jimp";
import sgMail from "@sendgrid/mail";

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
  const { id } = req.params;
  try {
    const updatedUser = await updateUserDetails(id, req.body);
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    const sanitizedUser = {
      nickname: updatedUser.nickname,
      email: updatedUser.email,
      gender: updatedUser.gender,
      weight: updatedUser.weight,
      activeTime: updatedUser.activeTime,
      subscription: updatedUser.subscription,
      dailyWaterIntake: updatedUser.dailyWaterIntake,
      avatarURL: updatedUser.avatarURL,
      verify: updatedUser.verify,
      timezone: updatedUser.timezone
    };
    res.json({ message: "User updated", user: sanitizedUser });
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
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    // Process the image with Jimp
    const image = await jimp.read(req.file.path);
    await image.resize(250, 250).quality(60).writeAsync(req.file.path);

    // Define new path for the processed image
    const newPath = path.join("public", "avatars", req.file.filename); // Use path.join to create the file path

    // Move file from tmp to public/avatars
    await fs.rename(req.file.path, newPath);

    // Update user's avatar URL in the database
    const avatarURL = path.join("/avatars", req.file.filename); // Use path.join to create the URL path
    await User.findByIdAndUpdate(req.user._id, { avatarURL });

    // Send back the new avatar URL
    res.status(200).json({ avatarURL });
  } catch (error) {
    await fs.unlink(req.file.path); // Cleanup if something goes wrong
    next(error);
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { verificationToken } = req.params;
    const user = await User.findOneAndUpdate(
      { verificationToken },
      { $set: { verify: true, verificationToken: null } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Verification successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resendVerificationEmail = async (req, res, next) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email, verify: false });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found or already verified" });
    }

    const verificationUrl = `http://${req.headers.host}/api/users/verify/${user.verificationToken}`;
    const mailOptions = {
      to: email,
      from: "jaycikey@gmail.com",
      subject: "Verify your email",
      text: `Please click on the following link to verify your email: ${verificationUrl}`,
      html: `<strong>Please click on the following link to verify your email:</strong> <a href="${verificationUrl}">${verificationUrl}</a>`,
    };

    await sgMail.send(mailOptions);
    res.status(200).json({ message: "Verification email sent" });
  } catch (error) {
    next(error);
  }
};

export const refreshUserTokens = async (req, res, next) => {
  try {
    const { token, refreshToken } = await refreshTokens(req.user, req.body.refreshToken);
    res.json({ token, refreshToken });
  } catch (error) {
    next(error);
  }
};


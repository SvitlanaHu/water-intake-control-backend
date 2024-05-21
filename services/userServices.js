import gravatar from "gravatar";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import HttpError from "../helpers/HttpError.js";
import { nanoid } from "nanoid";
import sgMail from "@sendgrid/mail";

// Workaround for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sendEmail = async (to, subject, htmlContent) => {
  const msg = {
    to,
    from: "jaycikey@gmail.com",
    subject,
    html: htmlContent,
  };
  await sgMail.send(msg);
};

export async function registerUser({ email, password, timezone = 'UTC' }, host) {
  const lowerCaseEmail = email.toLowerCase();
  const existingUser = await User.findOne({ email: lowerCaseEmail });
  if (existingUser) {
    throw HttpError(403, "Email in use");
  }

  const verificationToken = nanoid();
  const nickname = lowerCaseEmail.split('@')[0];

  const avatarURL = gravatar.url(email, { s: "100", r: "pg", d: "mm" }, true);
  const hashedPassword = await bcrypt.hash(password, 12);
  const newUser = new User({
    email: lowerCaseEmail,
    password: hashedPassword,
    avatarURL,
    verificationToken,
    verify: false,
    timezone,
    nickname,
    gender: null,
    weight: 0,
    activeTime: 0,
    dailyWaterIntake: 1500,
  });
  await newUser.save();

  const verificationUrl = `http://${host}/api/users/verify/${verificationToken}`;
  const templatePath = path.join(__dirname, "../templates/verificationEmail.html");
  let htmlContent = await fs.readFile(templatePath, "utf8");
  htmlContent = htmlContent.replace("{{verificationUrl}}", verificationUrl);

  await sendEmail(newUser.email, "Verify Your Email", htmlContent);

  return {
    email: newUser.email,
    nickname: newUser.nickname,
    subscription: newUser.subscription,
    avatarURL: newUser.avatarURL,
    verify: newUser.verify,
    timezone: newUser.timezone,
    gender: newUser.gender,
    weight: newUser.weight,
    activeTime: newUser.activeTime,
    dailyWaterIntake: newUser.dailyWaterIntake,
  };
}

export async function loginUser({ email, password }) {
  const lowerCaseEmail = email.toLowerCase();
  const user = await User.findOne({ email: lowerCaseEmail });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw HttpError(401, "Email or password is wrong");
  }
  if (!user.verify) {
    throw HttpError(403, "Email not verified");
  }
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
  user.token = token;
  user.refreshToken = refreshToken;

  await user.save();
  return {
    token,
    refreshToken,
    user: {
      email: user.email,
      nickname: user.nickname,
      subscription: user.subscription,
      avatarURL: user.avatarURL,
      verify: user.verify,
      timezone: user.timezone,
      gender: user.gender,
      weight: user.weight,
      activeTime: user.activeTime,
      dailyWaterIntake: user.dailyWaterIntake,
    },
  };
}

export async function logoutUser(user) {
  user.token = null;
  user.refreshToken = null;
  await user.save();
}

export const updateUserDetails = async (userId, updateData, host) => {
  // List of allowed fields for update
  const allowedFields = ["nickname", "email", "timezone", "gender", "weight", "activeTime", "dailyWaterIntake"];

  // Check for disallowed fields
  const disallowedFields = Object.keys(updateData).filter(key => !allowedFields.includes(key));
  if (disallowedFields.length > 0) {
    throw HttpError(400, `Disallowed fields: ${disallowedFields.join(", ")}`);
  }

  const user = await User.findById(userId);
  if (!user) {
    throw HttpError(404, 'User not found');
  }

  // Check for changes
  const changes = {};
  let hasChanges = false;

  allowedFields.forEach(field => {
    if (updateData[field] !== undefined && updateData[field] !== user[field]) {
      changes[field] = updateData[field];
      hasChanges = true;
    }
  });

  if (!hasChanges) {
    throw HttpError(400, 'No changes detected');
  }

  // Check for email change
  if (changes.email) {
    const existingUser = await User.findOne({ email: changes.email.toLowerCase() });
    if (existingUser && existingUser._id.toString() !== userId) {
      throw HttpError(409, 'Email already in use');
    }

    if (changes.email.toLowerCase() !== user.email.toLowerCase()) {
      changes.email = changes.email.toLowerCase();
      changes.verify = false;
      changes.verificationToken = nanoid();

      const verificationUrl = `http://${host}/api/users/verify/${changes.verificationToken}`;
      const templatePath = path.join(__dirname, '../templates/verificationEmail.html');
      let htmlContent = await fs.readFile(templatePath, 'utf8');
      htmlContent = htmlContent.replace('{{verificationUrl}}', verificationUrl);

      await sendEmail(changes.email, 'Verify Your Email', htmlContent);
    }
  }

  // Update only modified fields
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: changes },
    { new: true, runValidators: true }
  );

  if (!updatedUser) {
    throw HttpError(500, 'Failed to update user');
  }

  return {
    email: updatedUser.email,
    nickname: updatedUser.nickname,
    subscription: updatedUser.subscription,
    avatarURL: updatedUser.avatarURL,
    verify: updatedUser.verify,
    timezone: updatedUser.timezone,
    gender: updatedUser.gender,
    weight: updatedUser.weight,
    activeTime: updatedUser.activeTime,
    dailyWaterIntake: updatedUser.dailyWaterIntake,
  };
};

export async function getCurrentUser(user) {
  return {
    email: user.email,
    nickname: user.nickname,
    subscription: user.subscription,
    avatarURL: user.avatarURL,
    verify: user.verify,
    timezone: user.timezone,
    gender: user.gender,
    weight: user.weight,
    activeTime: user.activeTime,
    dailyWaterIntake: user.dailyWaterIntake,
  };
}

export async function updateUserSubscription(userId, subscription) {
  const user = await User.findByIdAndUpdate(
    userId,
    { subscription },
    { new: true }
  );
  if (!user) {
    throw new HttpError(404, "User not found");
  }
  return user;
}

export async function refreshTokens(user, providedRefreshToken) {
  try {
    // Generate new tokens
    const newToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    const newRefreshToken = jwt.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET, {
      expiresIn: "7d",
    });

    // Update the user's record with the new refresh token
    user.token = newToken;
    user.refreshToken = newRefreshToken;
    await user.save();

    return {
      token: newToken,
      refreshToken: newRefreshToken,
    };
  } catch (error) {
    throw error;
  }
}

export async function getTotalUsers() {
  const totalUsers = await User.countDocuments();
  const lastFiveUsers = await User.find({}, { avatarURL: 1, _id: 0 })
    .sort({ _id: -1 })
    .limit(5);

  const avatars = lastFiveUsers.map(user => user.avatarURL);

  return {
    totalUsers,
    lastFiveAvatars: avatars
  };
}

export async function verifyEmailService(verificationToken) {
  const user = await User.findOneAndUpdate(
    { verificationToken },
    { $set: { verify: true, verificationToken: "null" } },
    { new: true }
  );

  if (!user) {
    return { token: null, refreshToken: null };
  }

  // Generate tokens
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });

  user.token = token;
  user.refreshToken = refreshToken;
  await user.save();

  return { token, refreshToken };
}

export async function uploadAvatar(userId, file) {
  if (!file) {
    throw new HttpError(400, "No file uploaded");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new HttpError(404, "User not found");
  }

  // Delete old avatar from Cloudinary
  if (user.avatarPublicId) {
    await cloudinary.uploader.destroy(user.avatarPublicId);
  }

  // Upload new avatar to Cloudinary
  const result = await cloudinary.uploader.upload(file.path, {
    folder: "avatars",
  });

  user.avatarURL = result.secure_url;
  user.avatarPublicId = result.public_id;
  await user.save();

  return user.avatarURL;
}

export async function requestPasswordResetService(email, host) {
  const user = await User.findOne({ email });
  if (!user) {
    throw new HttpError(404, "User not found");
  }

  const resetToken = nanoid();
  const resetUrl = `http://${host}/api/users/reset-password/${resetToken}`;
  user.resetToken = resetToken;
  user.resetTokenExpiration = Date.now() + 3600000; // 1 hour from now
  await user.save();

  const templatePath = path.join(__dirname, "../templates/passwordResetEmail.html");
  let htmlContent = await fs.readFile(templatePath, "utf8");
  htmlContent = htmlContent.replace("{{resetUrl}}", resetUrl);

  await sendEmail(user.email, "Reset Your Password", htmlContent);
}

export async function validateResetTokenService(token) {
  const user = await User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() }
  });
  return !!user;
}

export async function resetPasswordService(token, newPassword) {
  const user = await User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() }
  });
  if (!user) {
    return false;
  }

  user.password = await bcrypt.hash(newPassword, 12);
  user.resetToken = undefined;
  user.resetTokenExpiration = undefined;
  await user.save();

  return true;
}

export const resendVerificationEmailService = async (email, host) => {
  const lowerCaseEmail = email.toLowerCase();
  const user = await User.findOne({ email: lowerCaseEmail });

  if (!user) {
    throw HttpError(404, 'User not found');
  }

  if (user.verify) {
    throw HttpError(400, 'Email already verified');
  }

  const verificationToken = nanoid();
  user.verificationToken = verificationToken;
  await user.save();

  const verificationUrl = `http://${host}/api/users/verify/${verificationToken}`;
  const templatePath = path.join(__dirname, '../templates/verificationEmail.html');
  let htmlContent = await fs.readFile(templatePath, 'utf8');
  htmlContent = htmlContent.replace('{{verificationUrl}}', verificationUrl);

  await sendEmail(user.email, 'Verify Your Email', htmlContent);
};
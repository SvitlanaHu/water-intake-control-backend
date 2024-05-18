import gravatar from "gravatar";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import HttpError from "../helpers/HttpError.js";
import { nanoid } from "nanoid";
import sgMail from "@sendgrid/mail";

export async function registerUser({ email, password, timezone = 'UTC' }, host) {
  const lowerCaseEmail = email.toLowerCase();
  const existingUser = await User.findOne({ email: lowerCaseEmail });
  if (existingUser) {
    throw HttpError(409, "Email in use");
  }

  const verificationToken = nanoid();
  const nickname = lowerCaseEmail.split('@')[0];

  const avatarURL = gravatar.url(email, { s: "100", r: "pg", d: "mm" }, true);
  const hashedPassword = await bcrypt.hash(password, 12);
  const newUser = new User({
    email: lowerCaseEmail,
    password: hashedPassword,
    avatarURL, // Store the avatar URL in the User record
    verificationToken,
    verify: false,
    timezone,
    nickname
  });
  await newUser.save();

  const verificationUrl = `http://${host}/api/users/verify/${verificationToken}`;
  const mailOptions = {
    to: email,
    from: "jaycikey@gmail.com",
    subject: "Verify your email",
    text: `Please click on the following link to verify your email: ${verificationUrl}`,
    html: `<strong>Please click on the following link to verify your email:</strong> <a href="${verificationUrl}">${verificationUrl}</a>`,
  };

  await sgMail.send(mailOptions);

  return {
    email: newUser.email,
    subscription: newUser.subscription,
    avatarURL: newUser.avatarURL,
    verify: newUser.verify,
    timezone: newUser.timezone,
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
      userId: user._id,
      email: user.email,
      subscription: user.subscription,
    },
  };
}

export async function logoutUser(user) {
  user.token = null;
  user.refreshToken = null;
  await user.save();
}

export async function updateUserDetails(userId, updateData) {
  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 12);
  }
  if (updateData.email) {
    updateData.email = updateData.email.toLowerCase();
  }
  const user = await User.findByIdAndUpdate(
    userId,
    updateData,
    { new: true }
  );
  if (!user) {
    throw new Error('User not found');
  }
  return user;
}

export async function getCurrentUser(user) {
  return {
    userId: user._id,
    email: user.email,
    subscription: user.subscription,
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

export async function refreshTokens(user, refreshToken) {
  if (user.refreshToken !== refreshToken) {
    throw HttpError(401, "Invalid refresh token");
  }
  const newToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  const newRefreshToken = jwt.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
  user.token = newToken;
  user.refreshToken = newRefreshToken;
  await user.save();
  return {
    token: newToken,
    refreshToken: newRefreshToken,
  };
}
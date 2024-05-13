import gravatar from "gravatar";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import HttpError from "../helpers/HttpError.js";
import { nanoid } from "nanoid";
import sgMail from "@sendgrid/mail";

export async function registerUser({ email, password, timezone = 'UTC'}, host) {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw HttpError(409, "Email in use");
  }

  const verificationToken = nanoid();

  const avatarURL = gravatar.url(email, { s: "100", r: "pg", d: "mm" }, true);
  const hashedPassword = await bcrypt.hash(password, 12);
  const newUser = new User({
    email,
    password: hashedPassword,
    avatarURL, // Store the avatar URL in the User record
    verificationToken,
    verify: false,
    timezone
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
    avatarURL: newUser.avatarURL, // Include the avatar URL in the registration response
  };
}

export async function loginUser({ email, password }) {
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw HttpError(401, "Email or password is wrong");
  }
  if (!user.verify) {
    throw HttpError(403, "Email not verified");
  }
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  user.token = token;
  await user.save();
  return {
    token,
    user: {
      userId: user._id,
      email: user.email,
      subscription: user.subscription,
    },
  };
}

export async function logoutUser(user) {
  user.token = null;
  await user.save();
}

export async function updateUserDetails(userId, updateData) {
  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 12);
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

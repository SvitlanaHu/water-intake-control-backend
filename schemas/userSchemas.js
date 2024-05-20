import Joi from "joi";

export const userRegisterSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  timezone: Joi.string().optional(),
});

export const userLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});


export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

export const updateSubscriptionSchema = Joi.object({
  subscription: Joi.string().valid("starter", "pro", "business").required(),
});

export const resendVerificationSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const updateUserSchema = Joi.object({
  nickname: Joi.string(),
  email: Joi.string().email(),
  gender: Joi.string(),
  weight: Joi.number(),
  activeTime: Joi.number(),
  dailyWaterIntake: Joi.number(),
  password: Joi.string().min(6),
  avatarURL: Joi.string(),
  timezone: Joi.string(),
  subscription: Joi.string().valid("starter", "pro", "business"),
}).or('nickname', 'email', 'gender', 'weight', 'activeTime', 'dailyWaterIntake', 'password', 'avatarURL', 'timezone', 'subscription');

export const requestPasswordResetSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
});
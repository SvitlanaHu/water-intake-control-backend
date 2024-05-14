import Joi from "joi";

export const userRegisterSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  timezone: Joi.string().optional(),
});

export const updateSubscriptionSchema = Joi.object({
  subscription: Joi.string().valid("starter", "pro", "business").required(),
});

export const resendVerificationSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const updateUserSchema = Joi.object({
  email: Joi.string().email(),
  password: Joi.string().min(6),
  subscription: Joi.string().valid("starter", "pro", "business"),
  timezone: Joi.string() 
}).or('email', 'password', 'subscription', 'timezone');

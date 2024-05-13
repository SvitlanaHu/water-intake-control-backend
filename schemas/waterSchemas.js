import Joi from 'joi';


export const createWaterRecordSchema = Joi.object({
  volume: Joi.number().min(0).required(),
  date: Joi.date().required(),
  timezone: Joi.string().required()
});


export const updateWaterRecordSchema = Joi.object({
  volume: Joi.number().min(0),
  date: Joi.date(),
  timezone: Joi.string()
}).or('volume', 'date', 'timezone');  

export const dailyWaterQuerySchema = Joi.object({
  timezone: Joi.string().required()
});

export const dailyWaterParamsSchema = Joi.object({
  date: Joi.date().required()
});

export const monthlyWaterParamsSchema = Joi.object({
  year: Joi.number().integer().required(),
  month: Joi.number().integer().min(1).max(12).required()
});

export const monthlyWaterQuerySchema = Joi.object({
  timezone: Joi.string().required()
});

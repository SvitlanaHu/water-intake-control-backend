import express from "express";
import {
  createWaterRecord,
  updateWaterRecordController,
  deleteWaterRecord,
  getDailyWaterData,
  getMonthlyWaterData,
} from "../controllers/waterControllers.js";
import { createWaterRecordSchema, updateWaterRecordSchema, dailyWaterParamsSchema,dailyWaterQuerySchema, monthlyWaterParamsSchema, monthlyWaterQuerySchema } from '../schemas/waterSchemas.js';
import validateBody from '../helpers/validateBody.js';
import validateParams from '../helpers/validateParams.js';
import validateQuery from '../helpers/validateQuery.js';
import authenticate from '../middleware/authenticate.js';

const waterRouter = express.Router();

waterRouter.post("/", authenticate,validateBody(createWaterRecordSchema), createWaterRecord);
waterRouter.put("/:id", authenticate,validateBody(updateWaterRecordSchema), updateWaterRecordController);
waterRouter.delete("/:id", authenticate, deleteWaterRecord);
waterRouter.get("/daily/:date", authenticate, validateParams(dailyWaterParamsSchema), validateQuery(dailyWaterQuerySchema), getDailyWaterData);
waterRouter.get("/monthly/:year/:month", authenticate, validateParams(monthlyWaterParamsSchema), validateQuery(monthlyWaterQuerySchema), getMonthlyWaterData);
export default waterRouter;

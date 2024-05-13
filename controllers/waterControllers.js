import User from "../models/User.js";
import {
    addWaterRecord,
    updateWaterRecord,
    removeWaterRecord,
    getDailyWater,
    getMonthlyWater,
  } from "../services/waterServices.js";
  
  export const createWaterRecord = async (req, res, next) => {
    const ownerId = req.user._id;
    try {
      const record = await addWaterRecord(req.body, ownerId);
      res.status(201).json(record);
    } catch (error) {
      next(error);
    }
  };
  
  export const updateWaterRecordController = async (req, res, next) => {
    const { id } = req.params;
    const ownerId = req.user._id;
    try {
      const updatedRecord = await updateWaterRecord(id, req.body, ownerId);
      if (!updatedRecord) {
        return res.status(404).json({ message: "Not found" });
      }
      res.json(updatedRecord);
    } catch (error) {
      next(error);
    }
  };
  
  export const deleteWaterRecord = async (req, res, next) => {
    const { id } = req.params;
    const ownerId = req.user._id;
    try {
      const record = await removeWaterRecord(id, ownerId);
      if (!record) {
        return res.status(404).json({ message: "Not found" });
      }
      res.json(record);
    } catch (error) {
      next(error);
    }
  };
  
  export const getDailyWaterData = async (req, res, next) => {
    const { date } = req.params;// YYYY-MM-DD
    const { timezone } = req.query; 
    const ownerId = req.user._id;
  
    try {
      const user = await User.findById(ownerId);
      const records = await getDailyWater(date, timezone, ownerId);
      res.json(records);
    } catch (error) {
      next(error);
    }
  };
  
  export const getMonthlyWaterData = async (req, res, next) => {
    const { year, month } = req.params;
    const { timezone } = req.query;
  
    const ownerId = req.user._id;
  
    try {
      const records = await getMonthlyWater(year, month, timezone, ownerId);
      res.json(records);
    } catch (error) {
      next(error);
    }
  };
  
  
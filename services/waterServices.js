import WaterConsumption from "../models/WaterConsumption.js";
import moment from "moment-timezone";
import { ObjectId } from 'mongodb';

// Add a water consumption record
async function addWaterRecord({ volume, date }, ownerId) {
  return await WaterConsumption.create({ volume, date, owner: ownerId });
}

// Update a water consumption record
async function updateWaterRecord(recordId, { volume, date }, ownerId) {
  return await WaterConsumption.findOneAndUpdate(
    { _id: recordId, owner: ownerId },
    { volume, date },
    { new: true }
  );
}

// Delete a water consumption record
async function removeWaterRecord(recordId, ownerId) {
  return await WaterConsumption.findOneAndDelete({ _id: recordId, owner: ownerId });
}

// Get daily water consumption
async function getDailyWater(date, timezone, ownerId) {
  const startOfDay = moment.tz(date, timezone).startOf('day').toDate();
  const endOfDay = moment.tz(date, timezone).endOf('day').toDate();

  const records = await WaterConsumption.find({
    owner: new ObjectId(ownerId),
    date: { $gte: startOfDay, $lt: endOfDay }
  });

  const totalVolume = records.reduce((sum, record) => sum + record.volume, 0);

  return {
    totalVolume,
    count: records.length,
    records: records.map(record => ({
      id: record._id,
      volume: record.volume,
      date: record.date
    }))
  };
}

// Get monthly water consumption
async function getMonthlyWater(year, month, timezone, ownerId) {
  const startDate = moment.tz({ year, month: month - 1 }, timezone).startOf('month').toDate();
  const endDate = moment.tz({ year, month: month - 1 }, timezone).endOf('month').toDate();

  const records = await WaterConsumption.find({
    owner: new ObjectId(ownerId),
    date: { $gte: startDate, $lt: endDate }
  });

  const totalVolume = records.reduce((sum, record) => sum + record.volume, 0);

  return {
    totalVolume,
    count: records.length,
    records: records.map(record => ({
      id: record._id,
      volume: record.volume,
      date: record.date
    }))
  };
}



export {
  addWaterRecord,
  updateWaterRecord,
  removeWaterRecord,
  getDailyWater,
  getMonthlyWater,
};

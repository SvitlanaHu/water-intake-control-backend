import mongoose from "mongoose";

const waterConsumptionSchema = new mongoose.Schema({
  volume: { type: Number, required: true },
  date: { type: Date, required: true },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const WaterConsumption = mongoose.model("WaterConsumption", waterConsumptionSchema);
export default WaterConsumption;

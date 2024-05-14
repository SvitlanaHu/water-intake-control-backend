const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        // console.log("Database connection successful");
    } catch (error) {
        // console.error("Database connection error:", error);
        process.exit(1);
    }
};

module.exports = connectDB;

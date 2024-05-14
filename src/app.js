const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const connectDB = require("../server.js");
require('dotenv').config();

const app = express();

connectDB()

app.use(morgan("tiny"));
app.use(cors());
app.use(express.json());

app.use((_, res) => {
    res.status(404).json({
        status: 404,
        message: "Endpoint not found"
    });
});

// eslint-disable-next-line no-unused-vars
app.use((err, _, res, next) => {
    const { status = 500, message = "Server error" } = err;
    res.status(status).json({
        status,
        message
    });
});

app.listen(3000, () => {
    console.log("Server is running. Use our API on port: 3000");
});

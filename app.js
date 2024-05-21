import express from "express";
import { fileURLToPath } from "url";
import path from "path";
import mongoose from "mongoose";
import morgan from "morgan";
import cors from "cors";
import usersRouter from "./routes/usersRouter.js";
import waterRouter from "./routes/waterRouter.js";
import dotenv from "dotenv";
import sgMail from "@sendgrid/mail";
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.json' assert { type: "json" };


dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);




app.use(morgan("tiny"));
app.use(cors({
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  origin: '*'
}));
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.use("/api/users", usersRouter);
app.use("/api/water", waterRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  swaggerOptions: {
    requestInterceptor: (req) => {
      if (req.headers.Authorization && !req.headers.Authorization.startsWith('Bearer ')) {
        req.headers.Authorization = 'Bearer ' + req.headers.Authorization;
      }
      return req;
    }
  }
}));

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Database connection successful");
  } catch (error) {
    console.error("Database connection error:", error.message);
    process.exit(1);
  }
};

connectDB();

app.use((_, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    return res.status(403).json({
      message: err.message,
      errors: err.errors
    });
  }
  const { status = 500, message = "Server error" } = err;
  res.status(status).json({ message });
});

app.use((err, req, res, next) => {
  const { status = 500, message = "Server error" } = err;
  res.status(status).json({ message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

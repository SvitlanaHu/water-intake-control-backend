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
import swaggerJsdoc from 'swagger-jsdoc';

dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Node.js API for Water Tracking App',
      version: '1.0.0',
      description: 'This is a simple CRUD API for managing users and water consumption data, documented with Swagger',
    },
    servers: [
      {
        url: 'http://localhost:3000', //need to change
        description: 'Development server',
      },
    ],
  },
  apis: [path.join(__dirname, 'swaggerDocumentation.js')], 
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);



app.use(morgan("tiny"));
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.use("/api/users", usersRouter);
app.use("/api/water", waterRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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
  const { status = 500, message = "Server error" } = err;
  res.status(status).json({ message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

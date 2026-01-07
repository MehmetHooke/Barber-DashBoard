import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import serviceRoutes from "./routes/service.routes.js";
import workingHoursRoutes from "./routes/workingHours.routes.js";

dotenv.config();

export const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/auth", authRoutes);

app.use("/services", serviceRoutes);

app.use("/working-hours", workingHoursRoutes);

app.use((_req, res) => res.status(404).json({ message: "Route not found" }));

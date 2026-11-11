import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// Module routes
import authRoutes from "./modules/auth/auth.routes.js";
import roomRoutes from "./modules/room/room.routes.js";
import uploadRoutes from "./modules/upload/upload.routes.js";

const app = express();

// Global Middlewares
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim().replace(/\/+$/, ""))
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      const normalizedOrigin = origin.replace(/\/+$/, "");
      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get("/health", (req, res) => {
  return res.status(200).json({
    status: "ok",
    message: "Room Shifting LPU Backend is healthy and running",
  });
});

// Modular Domain Endpoints
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/upload", uploadRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.url} - Endpoint Not Found`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export default app;
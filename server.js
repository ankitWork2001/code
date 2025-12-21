import "dotenv/config"; // <-- MUST be FIRST
import express from "express";
import connectDB from "./config/db.js";
import cors from "cors";
import './utils/cron.js';

// Route Imports
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import airBookingRoutes from "./routes/airBookingRoutes.js";
import requestRoutes from "./routes//requestRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to the database:", error);
    process.exit(1);
  });

// Default Route
app.get("/", (req, res) => {
  res.send("Hello From Server");
});

// Route Usage
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/air-bookings", airBookingRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/notifications", notificationRoutes);

app.use("/api/files", uploadRoutes);

app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});


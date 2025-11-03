import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./config/db.js";
import UsersRoute from "./routes/userRoutes.js";
import jwtRoute from "./routes/jwt.js";
import http from "http";
import { Server } from "socket.io";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import { scheduleDailyAttendanceCheck } from "./cron/attendanceCron.js";
import "./cron/autoMarkAbsence.js";
import leaveRoutes from "./routes/leaveRoutes.js";
import "./cron/resetHolidays.js";



const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send("Server is running...");
});
app.use("/", jwtRoute);
app.use("/api/users", UsersRoute);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leave", leaveRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong", error: err.message });
});

// Create HTTP server and Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

scheduleDailyAttendanceCheck(io);
// Make io accessible to routes/controllers
app.set("io", io);

// Connect DB and start server
const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

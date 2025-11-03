import express from "express";
import {
  markAttendance,
  getMyAttendance,
  getTodayStatus,
  getAllAttendance,
  verifyAttendance,
} from "../controllers/attendanceController.js";
import { verifyAdmin, verifyEmployee, verifyToken } from "../middleware/auth.js";

const attendanceRoutes = express.Router();

// Employee
attendanceRoutes.post("/mark", verifyEmployee, markAttendance);
attendanceRoutes.get("/my", verifyEmployee, getMyAttendance);
attendanceRoutes.get("/today", verifyToken, getTodayStatus);

// Admin
attendanceRoutes.get("/all", verifyAdmin, getAllAttendance);
attendanceRoutes.post("/verify", verifyAdmin, verifyAttendance);

export default attendanceRoutes;

import express from "express";
import {
  markAttendance,
  getMyAttendance,
  getTodayStatus,
  getAllAttendance,
  verifyAttendance,
  searchAttendance,
  getAttendanceRecords,
  editAttendance,
} from "../controllers/attendanceController.js";
import { verifyAdmin, verifyEmployee, verifyToken } from "../middleware/auth.js";

const attendanceRoutes = express.Router();

// Employee
attendanceRoutes.post("/mark", verifyEmployee, markAttendance);
attendanceRoutes.get("/my", verifyEmployee, getMyAttendance);
attendanceRoutes.get("/today", verifyToken, getTodayStatus);
attendanceRoutes.get("/search", verifyToken, searchAttendance);

// Admin
attendanceRoutes.get("/all", verifyAdmin, getAllAttendance);
attendanceRoutes.post("/verify", verifyAdmin, verifyAttendance);
attendanceRoutes.get("/records", verifyAdmin, getAttendanceRecords); // 📅 advanced pagination/filter
attendanceRoutes.put("/edit", verifyAdmin, editAttendance);

export default attendanceRoutes;

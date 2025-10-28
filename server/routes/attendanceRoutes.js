import express from "express";
import {
  markAttendance,
  getMyAttendance,
  getTodayStatus,
  getAllAttendance
} from "../controllers/attendanceController.js";

import { verifyAdmin, verifyEmployee, verifyToken } from "../middleware/auth.js";

const attendanceRoutes = express.Router();

// Employee
attendanceRoutes.post("/mark", verifyToken, markAttendance);    // mark either Attend or Absence
attendanceRoutes.get("/my", verifyEmployee, getMyAttendance);      // history for logged-in user
attendanceRoutes.get("/today", verifyToken, getTodayStatus);       // today's status (for profile/dashboard)

// Admin
attendanceRoutes.get("/all", verifyAdmin, getAllAttendance);       // all attendance (table)

export default attendanceRoutes;

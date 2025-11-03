import express from "express";
import { verifyAdmin, verifyEmployee, verifyToken } from "../middleware/auth.js";
import { submitLeave, getAllLeaves, updateLeaveStatus, getMyLeaves } from "../controllers/leaveController.js";

const leaveRoutes = express.Router();

// Employee
leaveRoutes.post("/submit", verifyEmployee, submitLeave);
leaveRoutes.get("/my", verifyEmployee, getMyLeaves);

// Admin
leaveRoutes.get("/all", verifyAdmin, getAllLeaves);
leaveRoutes.patch("/update/:leaveId", verifyAdmin, updateLeaveStatus);

export default leaveRoutes;

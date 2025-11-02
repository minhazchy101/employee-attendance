import express from "express";
import upload from "../middleware/multer.js";
import {
  registerUser,
  getAllUsers,
  getUserByEmail,
  updateUserProfile,
  updateUserRole,
  deleteUser,
} from "../controllers/userController.js";
import { verifyAdmin, verifyToken } from "../middleware/auth.js";

const UsersRoute = express.Router();

/* ===============================
   🟢 PUBLIC ROUTE
================================= */
UsersRoute.post("/register", upload.single("image"), registerUser);

/* ===============================
   🔒 PROTECTED ROUTES
================================= */
UsersRoute.get("/all", verifyAdmin, getAllUsers);
UsersRoute.get("/profile/:email", verifyToken, getUserByEmail);
UsersRoute.put(
  "/update-profile/:userId",
  upload.single("image"),
  verifyToken,
  updateUserProfile
);
UsersRoute.put("/update-role/:userId", verifyAdmin, updateUserRole);
UsersRoute.delete("/delete/:userId", verifyAdmin, deleteUser);

export default UsersRoute;

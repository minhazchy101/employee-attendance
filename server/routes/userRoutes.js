import express from "express";
import {
  getAllUsers,
  getUserByEmail,
  updateUserProfile,
  registerUser,
  deleteUser,
  updateUserRole,
} from "../controllers/userController.js";
import { verifyAdmin, verifyToken } from "../middleware/auth.js";
import upload from "../middleware/multer.js";


const UsersRoute = express.Router();

// Public route
UsersRoute.post("/register", upload.single("image"), registerUser);

// Protected routes
UsersRoute.get("/all", verifyAdmin, getAllUsers);

UsersRoute.get("/profile/:email", verifyToken, getUserByEmail);
UsersRoute.put("/update-profile/:userId", upload.single("image"), verifyToken, updateUserProfile);

UsersRoute.put("/update-role/:userId", verifyAdmin, updateUserRole);
UsersRoute.delete("/delete/:userId", verifyAdmin, deleteUser);

export default UsersRoute;

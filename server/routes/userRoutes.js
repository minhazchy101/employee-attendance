import express from "express";
import {
  getAllUsers,
  getUserByEmail,
  
  registerUser,
  
  updateUserRole,
} from "../controllers/userController.js";
import { verifyAdmin } from "../middleware/auth.js";
import upload from "../middleware/multer.js";

const UsersRoute = express.Router();

// Public route
UsersRoute.post("/register", upload.single("image"), registerUser);

// Protected routes
UsersRoute.get("/all", verifyAdmin, getAllUsers);
UsersRoute.get("/profile/:email", getUserByEmail); // Profile route can be public if authenticated via token
UsersRoute.put("/update-role/:userId", verifyAdmin, updateUserRole);

export default UsersRoute;

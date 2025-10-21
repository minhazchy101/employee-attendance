import express from 'express';


import { getAllUsers, loginUser, registerUser, updateUserRole } from '../controllers/userController.js';
import { verifyAdmin } from '../middleware/auth.js';

const UsersRoute = express.Router();

// Public routes
UsersRoute.post('/register', registerUser);
UsersRoute.post('/login', loginUser);

// Protected (admin only)
UsersRoute.get('/all', verifyAdmin, getAllUsers);
UsersRoute.put('/update-role/:userId', verifyAdmin, updateUserRole);

export default UsersRoute;

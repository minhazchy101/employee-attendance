import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Register a new user (default role: pending)
export const registerUser = async (req, res) => {
  try {
    const { fullName, email, photoURL } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(200).json(existingUser);

    const newUser = new User({
      fullName,
      email,
      photo: photoURL,
      role: "employee",
      status: "pending",
      joinDate: new Date(),
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Login user
export const loginUser = async (req, res) => {
  try {
    const { fullName ,email, password } = req.body;

    const user = await User.findOne({ email, fullName });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({ token, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Approve or update user role/jobTitle
export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, jobTitle } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role, jobTitle },
      { new: true }
    ).select('-password');

    if (!updatedUser) return res.status(404).json({ message: 'User not found' });

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

import imagekit from "../config/imageKit.js";
import User from "../models/User.js";

// Register or check existing user (Firebase-based)
export const registerUser = async (req, res) => {
  try {
    const { fullName, email, jobTitle, phoneNumber, niNumber } = req.body;

    // Basic validation
    if (!fullName || !email || !jobTitle || !phoneNumber || !niNumber) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(200).json(existingUser);

    // Ensure file exists
    const imageFile = req.file;
    if (!imageFile) {
      return res.status(400).json({ message: "Profile image is required." });
    }

    // ✅ Upload to ImageKit directly using buffer
   const uploadResponse = await imagekit.upload({
  file: imageFile.buffer,
  fileName: imageFile.originalname,
});


    // ✅ Use ImageKit's uploaded file URL directly
    const imageUrl = uploadResponse.url;

    // Create and save user
    const newUser = new User({
      fullName,
      email,
      image: imageUrl,
      jobTitle,
      phoneNumber,
      niNumber,
      role: "employee",
      status: "pending",
      joinDate: new Date(),
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};


// Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-__v");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update user role or job title (admin only)
export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, jobTitle } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role, jobTitle },
      { new: true }
    ).select("-__v");

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get user profile by email
export const getUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ email }).select("-__v");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

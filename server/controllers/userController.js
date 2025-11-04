import imagekit from "../config/imageKit.js";
import User from "../models/User.js";

/* ============================================
   🟢 REGISTER USER (Public)
============================================ */
export const registerUser = async (req, res) => {
  try {
    const { fullName, email, jobTitle, phoneNumber, niNumber } = req.body;

    if (!fullName || !email || !jobTitle || !phoneNumber || !niNumber) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists." });
    }

    let imageUrl = "";
    if (req.file) {
      const uploadResponse = await imagekit.upload({
        file: req.file.buffer,
        fileName: req.file.originalname,
      });
      imageUrl = uploadResponse.url;
    }

    const userCount = await User.countDocuments();
    const assignedRole = userCount === 0 ? "admin" : "pending request";
    const assignedStatus = userCount === 0 ? "active" : "waiting for approval";

    const newUser = new User({
      fullName,
      email,
      image: imageUrl,
      jobTitle,
      phoneNumber,
      niNumber,
      role: assignedRole,
      status: assignedStatus,
      joinDate: new Date(),
    });

    await newUser.save();

    // Emit websocket event
    req.app.get("io").emit("user-change", { type: "added", user: newUser });

    res.status(201).json({
      success: true,
      message:
        userCount === 0
          ? "Admin account created successfully."
          : "Registration successful. Waiting for admin approval.",
      user: newUser,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ============================================
   🟣 GET USER BY EMAIL (Protected)
============================================ */
export const getUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ email }).select("-__v");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ============================================
   🟡 GET ALL USERS (Admin Only)
============================================ */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).select("-__v");
    res.status(200).json( users );
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ============================================
   🔵 UPDATE USER ROLE / OFF-DAY (Admin Only)
============================================ */
export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { jobTitle, offDay } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.status !== "waiting for approval") {
      return res.status(400).json({ message: "User is already active." });
    }

    user.role = "employee"; // ✅ always employee
    user.jobTitle = jobTitle || user.jobTitle;
    user.offDay = offDay || user.offDay;
    user.status = "active";

    await user.save();

    req.app.get("io").emit("user-change", { type: "updated", user });

    res.status(200).json({
      success: true,
      message: "User approved as employee successfully.",
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ============================================
   🔴 DELETE USER (Admin Only)
============================================ */
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) return res.status(404).json({ message: "User not found" });

    req.app.get("io").emit("user-change", { type: "deleted", userId });

    res.status(200).json({
      success: true,
      message: "User deleted successfully.",
      userId,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ============================================
   🟢 UPDATE PROFILE (Employee Only)
============================================ */
export const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      fullName,
      jobTitle,
      phoneNumber,
      niNumber,
      address,
      passportNumber,
      passportExpireDate,
      jobStartDate,
      weeklyHours,
      hourlyRate,
      annualWages,
      offDay,
      emergencyContacts,
    } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    
    // Handle optional profile image
    if (req.file) {
      const uploadResponse = await imagekit.upload({
        file: req.file.buffer,
        fileName: req.file.originalname,
      });
      user.image = uploadResponse.url;
    }

    // Parse emergency contacts safely
    let parsedContacts = user.emergencyContacts || [];
    if (emergencyContacts) {
      try {
        parsedContacts = JSON.parse(emergencyContacts);
      } catch {
        parsedContacts = Array.isArray(emergencyContacts)
          ? emergencyContacts
          : [emergencyContacts];
      }
    }

    Object.assign(user, {
      fullName,
      jobTitle,
      phoneNumber,
      niNumber,
      address,
      passportNumber,
      passportExpireDate,
      jobStartDate,
      weeklyHours,
      hourlyRate,
      annualWages,
      offDay,
      emergencyContacts: parsedContacts,
    });

    // Check if profile is complete
    const requiredFields = [
      fullName,
      jobTitle,
      phoneNumber,
      niNumber,
      address,
      passportNumber,
      passportExpireDate,
      jobStartDate,
      weeklyHours,
      hourlyRate,
      annualWages,
      parsedContacts.length,
    ];
    user.isProfileComplete = requiredFields.every(Boolean);

    await user.save();

    req.app.get("io").emit("user-change", { type: "updated", user });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

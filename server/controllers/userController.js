import imagekit from "../config/imageKit.js";
import User from "../models/User.js";

/* ============================================
   🟢 REGISTER USER (Public)
============================================ */
export const registerUser = async (req, res) => {
  try {
    const { fullName, email, image, jobTitle, phoneNumber, niNumber } = req.body;

    if (!fullName || !email ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists." });
    }

    console.log('image : ', image)
    let imageUrl = image;
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
      // These fields are completed later
      jobTitle: "",
      phoneNumber: "",
      niNumber: "",

      sponsorshipLicenseNumber: "",
      sponsorDocuments: [],

      role: assignedRole,
      status: assignedStatus,
      joinDate: new Date(),

       isProfileComplete: assignedRole === "admin",
    });
    await newUser.save();
    // newUser.isProfileComplete = newUser.role === "admin" && (Boolean);
    // console.log("newUser.isProfileComplete : ", newUser.isProfileComplete)

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

export const getPendingUsers = async (req, res) => {
  try {
    const pending = await User.find({
      role: "pending request",
      isProfileComplete: true,
    })
      .sort({ createdAt: -1 })
      .select("-__v");

    res.status(200).json({ success: true, count: pending.length, users: pending });
  } catch (error) {
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
   🟢 GET USER BY ID (Admin Only)
============================================ */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params; // get user ID from URL
    const user = await User.findById(id).select("-__v"); // exclude __v
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
   🟢 UPDATE USER PROFILE (Employee Only)
============================================= */
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
      sponsorshipLicenseNumber,
    } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    /* -------------------------------------------------------
       1️⃣ HANDLE IMAGE UPLOAD (if provided)
    ------------------------------------------------------- */
    console.log('user.image : ', user.image)
    if (req.files?.image?.[0]) {
      const img = req.files.image[0];
      const uploaded = await imagekit.upload({
        file: img.buffer,
        fileName: img.originalname,
      });
      user.image = uploaded.url;
    }

    /* -------------------------------------------------------
       2️⃣ HANDLE SPONSOR DOCUMENTS UPLOAD (multiple PDFs)
    ------------------------------------------------------- */
    // if (req.files?.sponsorDocuments) {
    //   for (const doc of req.files.sponsorDocuments) {
    //     const uploadedDoc = await imagekit.upload({
    //       file: doc.buffer,
    //       fileName: doc.originalname,
    //     });
    //     user.sponsorDocuments.push(uploadedDoc.url);
    //   }
    // }

    if (req.body.existingDocuments) {
  let keepDocs = [];
  try {
    keepDocs = JSON.parse(req.body.existingDocuments); 
  } catch {}
  
  // Only keep the ones that the user wants
  user.sponsorDocuments = user.sponsorDocuments.filter(url => keepDocs.includes(url));
}

// Then handle new uploads as before
if (req.files?.sponsorDocuments) {
  for (const doc of req.files.sponsorDocuments) {
    const uploadedDoc = await imagekit.upload({
      file: doc.buffer,
      fileName: doc.originalname,
    });
    user.sponsorDocuments.push(uploadedDoc.url);
  }
}


    /* -------------------------------------------------------
       3️⃣ PARSE EMERGENCY CONTACTS SAFELY
    ------------------------------------------------------- */
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

    /* -------------------------------------------------------
       4️⃣ ASSIGN UPDATED FIELDS
    ------------------------------------------------------- */
    Object.assign(user, {
      fullName: fullName || user.fullName,
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
      sponsorshipLicenseNumber,
    });

    /* -------------------------------------------------------
       5️⃣ CHECK PROFILE COMPLETION
    ------------------------------------------------------- */
    const requiredFields = [
      user.fullName,
      user.jobTitle,
      user.phoneNumber,
      user.niNumber,
      user.address,
      user.passportNumber,
      user.passportExpireDate,
      user.jobStartDate,
      user.weeklyHours,
      user.hourlyRate,
      user.annualWages,
      parsedContacts.length,             // must have at least 1 contact
    ];

    user.isProfileComplete = requiredFields.every(Boolean);

    await user.save();

    /* -------------------------------------------------------
       6️⃣ EMIT WEBSOCKET & RESPOND
    ------------------------------------------------------- */
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

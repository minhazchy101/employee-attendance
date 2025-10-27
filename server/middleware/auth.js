import admin from "../config/firebaseAdmin.js";
import User from "../models/User.js";

// Verify Firebase Token
export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized. No token provided" });
  }
  
  const token = authHeader.split(" ")[1];
  // console.log('token : ', token)

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    // console.log("Decoded token:", decoded);

    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired Firebase token" });
  }
};

// Verify Admin Role
export const verifyAdmin = async (req, res, next) => {
  await verifyToken(req, res, async () => {
    try {
      const email = req.user.email;
      const user = await User.findOne({ email });
      // console.log("admin the user : " , user)
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin only" });
      }

      next();
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  });
};

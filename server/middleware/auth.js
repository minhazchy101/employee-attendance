import admin from "../config/firebaseAdmin.js";

// ✅ Verify Firebase Token
export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized. No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded; // contains email, uid, role (if custom claims added)
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired Firebase token" });
  }
};

// ✅ Verify Admin Role
export const verifyAdmin = async (req, res, next) => {
  await verifyToken(req, res, async () => {
    // You can check Firebase custom claims or your own DB record
    const email = req.user.email;
    const user = await User.findOne({ email });

    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }
    next();
  });
};

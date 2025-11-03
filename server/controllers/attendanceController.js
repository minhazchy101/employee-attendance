import Attendance from "../models/Attendance.js";
import User from "../models/User.js";

// POST /api/attendance/mark
export const markAttendance = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const today = new Date().toISOString().split("T")[0];

    const existing = await Attendance.findOne({ userEmail, date: today });
    if (existing) return res.status(400).json({ message: "Already marked today." });

    const attendance = await Attendance.create({
      userEmail,
      date: today,
      status: "pending", // pending admin verification
      method: "manual",
    });

    const io = req.app.get("io");
    io.emit("attendance-change", { userEmail, status: "pending" });

    res.status(201).json({ message: "Attendance marked (pending verification)." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Verify Attendance (Admin)
export const verifyAttendance = async (req, res) => {
  try {
    const { attendanceId, status } = req.body; // attended / unauthorized leave
    const record = await Attendance.findById(attendanceId);
    if (!record) return res.status(404).json({ message: "Attendance not found" });

    record.status = status;
    await record.save();

    const io = req.app.get("io");
    io.emit("attendance-change", { userEmail: record.userEmail, status });

    res.json({ message: "Attendance updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/attendance/my
export const getMyAttendance = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

    const records = await Attendance.find({
      userEmail,
      date: { $gte: monthStart, $lte: monthEnd },
    })
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const monthlyRecords = await Attendance.find({
      userEmail,
      date: { $gte: monthStart, $lte: monthEnd },
    });

  const presentDays = monthlyRecords.filter(r => r.status === "attended").length;
const authorizedLeave = monthlyRecords.filter(r => r.status === "authorized leave").length;
const offDays = monthlyRecords.filter(r => r.status === "off day").length;
const unauthorized = monthlyRecords.filter(r => r.status === "unauthorized leave").length;
const pending = monthlyRecords.filter(r => r.status === "pending").length;

const totalWorkDays = presentDays + authorizedLeave + unauthorized;
const attendanceRatio = totalWorkDays > 0
  ? Math.round((presentDays / totalWorkDays) * 100)
  : 0;

res.json({
  records,
  monthlySummary: { presentDays, authorizedLeave, offDays, unauthorized, pending, attendanceRatio },
  page,
  limit,
  total: monthlyRecords.length,
});

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// GET /api/attendance/today
export const getTodayStatus = async (req, res) => {
  try {
    const userEmail = req.user?.email;
    const date = new Date().toISOString().slice(0, 10);

    // 1️⃣ Find user
    const user = await User.findOne({ email: userEmail });
    if (!user) return res.status(404).json({ message: "User not found" });

    // 2️⃣ Find today’s record
    const rec = await Attendance.findOne({ userEmail, date });

    // 3️⃣ Monthly attendance summary (for pie chart)
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-indexed

    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);

    // employee's monthly data
    const monthlyRecords = await Attendance.find({
      userEmail,
      date: { $gte: startOfMonth.toISOString().slice(0, 10), $lte: endOfMonth.toISOString().slice(0, 10) },
    });

    const presentDays = monthlyRecords.filter(r => r.status === "Attend").length;
    const absentDays = monthlyRecords.filter(r => r.status === "Absence").length;
    const totalDays = presentDays + absentDays;
    const attendanceRatio = totalDays > 0
      ? Math.round((presentDays / totalDays) * 100)
      : 0;

    // 4️⃣ Build base response
    const response = {
      date,
      status: rec ? rec.status : "Not marked",
      record: rec || null,
      monthlySummary: {
        presentDays,
        absentDays,
        attendanceRatio,
      },
    };

    // 5️⃣ If user is admin → include totalEmployees and presentCount
    if (user.role === "admin") {
      const totalEmployees = await User.countDocuments({ role: "employee", status: "approved" });
      const presentCount = await Attendance.countDocuments({ date, status: "Attend" });

      response.totalEmployees = totalEmployees;
      response.presentCount = presentCount;
    }

    res.json(response);
  } catch (err) {
    console.error("getTodayStatus error:", err);
    res.status(500).json({ message: err.message });
  }
};


// GET /api/attendance/all  (admin)
export const getAllAttendance = async (req, res) => {
  try {
    // latest first
    const records = await Attendance.find().sort({ date: -1, createdAt: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

import Attendance from "../models/Attendance.js";
import User from "../models/User.js";
import Holiday from "../models/Holiday.js"; 
import Leave from "../models/Leave.js";

/**
 * 🧍‍♂️ Employee: Mark Attendance (manual request)
 */
export const markAttendance = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const today = new Date().toISOString().split("T")[0];

    // ✅ Block admin users completely (no attendance record)
    const user = await User.findOne({ email: userEmail });
    if (!user || user.role !== "employee") {
      return res.status(403).json({ message: "Access denied" });
    }

    const existing = await Attendance.findOne({ userEmail, date: today });
    if (existing) return res.status(400).json({ message: "Already marked today." });

    // Create pending attendance (awaiting admin verification)
    const attendance = await Attendance.create({
      userEmail,
      date: today,
      status: "pending",
      method: "manual",
    });

    // Realtime notification to admin dashboards
    const io = req.app.get("io");
    io.emit("attendance-change", { userEmail, status: "pending" });

    res.status(201).json({ message: "Attendance marked (pending verification)." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * 👨‍💼 Admin: Verify / Reject Attendance
 */
export const verifyAttendance = async (req, res) => {
  try {
    const { attendanceId, status } = req.body; // attended / unauthorized leave

    if (!["attended", "unauthorized leave"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    const record = await Attendance.findById(attendanceId);
    if (!record) return res.status(404).json({ message: "Attendance not found" });

    record.status = status;
    await record.save();

    const io = req.app.get("io");
    io.emit("attendance-change", { userEmail: record.userEmail, status });

    res.json({ message: "Attendance updated successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * 📅 Employee: Get Monthly Attendance + Summary
 */
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
      monthlySummary: {
        presentDays,
        authorizedLeave,
        offDays,
        unauthorized,
        pending,
        attendanceRatio,
      },
      page,
      limit,
      total: monthlyRecords.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * 📅 Employee: Get Today’s Attendance Status
 */
export const getTodayStatus = async (req, res) => {
  try {
    const userEmail = req.user?.email;
    const date = new Date().toISOString().slice(0, 10);

    const user = await User.findOne({ email: userEmail });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role !== "employee") return res.status(403).json({ message: "Access denied" });

    // 🔹 Check if today is off-day, global holiday, or approved leave
    const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
    const globalHoliday = await Holiday.findOne({ date });
    const approvedLeave = await Leave.findOne({
      userEmail,
      startDate: { $lte: date },
      endDate: { $gte: date },
      status: "approved",
    });

    let record = await Attendance.findOne({ userEmail, date });

    // --- Auto-create record if missing ---
    if (!record) {
      if(todayName === user.offDay) {
  record = await Attendance.create({
    userEmail,
    date,
    status: "off day",
    method: "auto",
    reason: "Weekly off"
  });
} else if (globalHoliday) {
  record = await Attendance.create({
    userEmail,
    date,
    status: "authorized leave",
    method: "auto",
    reason: globalHoliday.name || "Holiday"
  });
} else if (approvedLeave) {
  record = await Attendance.create({
    userEmail,
    date,
    status: "authorized leave",
    method: "leave-system",
    reason: approvedLeave.reasonType || "approved leave"
  });
}
    }

    // Monthly summary
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

    const monthlyRecords = await Attendance.find({
      userEmail,
      date: { $gte: startOfMonth, $lte: endOfMonth },
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
      date,
      status: record ? record.status : "not marked",
      record,
      monthlySummary: {
        presentDays,
        authorizedLeave,
        offDays,
        unauthorized,
        pending,
        attendanceRatio,
      },
    });
  } catch (err) {
    console.error("getTodayStatus error:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * 👨‍💼 Admin: Get all attendance records
 */
export const getAllAttendance = async (req, res) => {
  try {
    const records = await Attendance.find().sort({ date: -1, createdAt: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

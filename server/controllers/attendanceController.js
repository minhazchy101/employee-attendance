import Attendance from "../models/Attendance.js";
import User from "../models/User.js";
import Holiday from "../models/Holiday.js";
import Leave from "../models/Leave.js";

/**
 * 🧍‍♂️ Employee: Mark Attendance (Manual)
 */
export const markAttendance = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const date = new Date().toISOString().split("T")[0];

    const user = await User.findOne({ email: userEmail });
    if (!user || user.role !== "employee") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Prevent duplicate marking
    const existing = await Attendance.findOne({ userEmail, date });
    if (existing) {
      return res.status(400).json({ message: "Already marked today." });
    }

    const attendance = await Attendance.create({
      userEmail,
      fullName: user.fullName,
      date,
      status: "pending",
      method: "manual",
    });

    const io = req.app.get("io");
    io.emit("attendance-change", { userEmail, status: "pending" });

    res.status(201).json({ message: "Attendance marked (pending verification)." });
  } catch (err) {
    console.error("markAttendance error:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * 👨‍💼 Admin: Verify / Reject Attendance
 */
export const verifyAttendance = async (req, res) => {
  try {
    const { attendanceId, status } = req.body;

    if (!["attended", "unauthorized leave"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    const record = await Attendance.findById(attendanceId);
    if (!record) return res.status(404).json({ message: "Attendance not found" });

    record.status = status;
    await record.save();

    const io = req.app.get("io");
    io.emit("attendance-change", { userEmail: record.userEmail, status });

    res.json({ message: "Attendance updated successfully.", record });
  } catch (err) {
    console.error("verifyAttendance error:", err);
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
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .slice(0, 10);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .slice(0, 10);

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

    const summary = buildMonthlySummary(monthlyRecords);

    res.json({
      records,
      monthlySummary: summary,
      page,
      limit,
      total: monthlyRecords.length,
    });
  } catch (err) {
    console.error("getMyAttendance error:", err);
    res.status(500).json({ message: err.message });
  }
};


/**
 * 📅 Employee: Get Today’s Attendance Status + Remaining Holiday
 */
export const getTodayStatus = async (req, res) => {
  try {
    const userEmail = req.user?.email;
    const today = new Date();
    const date = today.toISOString().slice(0, 10);

    const user = await User.findOne({ email: userEmail });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role !== "employee") return res.status(403).json({ message: "Access denied" });

    const todayName = today.toLocaleDateString("en-US", { weekday: "long" });

    // Check for global holiday
    const globalHolidayToday = await Holiday.findOne({ date });

    // Check for approved leave today
    const approvedLeave = await Leave.findOne({
      userEmail,
      startDate: { $lte: date },
      endDate: { $gte: date },
      status: "approved",
    });

    // Check if attendance record exists
    let record = await Attendance.findOne({ userEmail, date });

    // Auto-create attendance if missing
    if (!record) {
      if (todayName === user.offDay) {
        record = await Attendance.create({
          userEmail,
          fullName: user.fullName,
          date,
          status: "off day",
          method: "auto",
          reason: "Weekly off",
        });
      } else if (globalHolidayToday) {
        record = await Attendance.create({
          userEmail,
          fullName: user.fullName,
          date,
          status: "authorized leave",
          method: "auto",
          reason: globalHolidayToday.name || "Public holiday",
        });
      } else if (approvedLeave) {
        record = await Attendance.create({
          userEmail,
          fullName: user.fullName,
          date,
          status: "authorized leave",
          method: "leave-system",
          reason: approvedLeave.reasonType || "approved leave",
        });
      }
    }

    // Monthly summary
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().slice(0, 10);
    const monthlyRecords = await Attendance.find({
      userEmail,
      date: { $gte: monthStart, $lte: monthEnd },
    });
    const summary = buildMonthlySummary(monthlyRecords);

    // 🔹 Holiday year: April 6 → next April 5
    let currentYear = today.getFullYear();
    let holidayYearStart = new Date(currentYear, 3, 6); // April 6
    let holidayYearEnd = new Date(currentYear + 1, 3, 5); // April 5 next year
    if (today < holidayYearStart) {
      holidayYearStart.setFullYear(currentYear - 1);
      holidayYearEnd.setFullYear(currentYear);
    }

    // Fetch global holidays for this holiday year
    const globalHolidays = await Holiday.find({
      date: {
        $gte: holidayYearStart.toISOString().slice(0, 10),
        $lte: holidayYearEnd.toISOString().slice(0, 10),
      },
    });
    const globalHolidayNames = globalHolidays.map(h => h.name || "Public holiday");

    // Count personal holidays (leave with reason "holiday") taken in this holiday year
    const personalHolidaysTaken = await Attendance.countDocuments({
      userEmail,
      date: { $gte: holidayYearStart.toISOString().slice(0, 10), $lte: holidayYearEnd.toISOString().slice(0, 10) },
      status: "authorized leave",
      method: "leave-system",
      reason: "holiday",
    });

    // Count global holidays taken (auto-created attendance)
    const globalHolidaysTaken = await Attendance.countDocuments({
      userEmail,
      date: { $gte: holidayYearStart.toISOString().slice(0, 10), $lte: holidayYearEnd.toISOString().slice(0, 10) },
      status: "authorized leave",
      method: "auto",
      reason: { $in: globalHolidayNames },
    });

    // 🔹 Remaining holiday calculation (integrates cron reset)
    const remainingHoliday = Math.max(
      (user.remainingHoliday ) - personalHolidaysTaken - globalHolidaysTaken,
      0
    );

    res.json({
      date,
      status: record ? record.status : "not marked",
      record,
      remainingHoliday,
      monthlySummary: summary,
    });
  } catch (err) {
    console.error("getTodayStatus error:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * 🧮 Helper: Monthly Summary Builder
 */
const buildMonthlySummary = (records) => {
  const presentDays = records.filter((r) => r.status === "attended").length;
  const authorizedLeave = records.filter((r) => r.status === "authorized leave").length;
  const offDays = records.filter((r) => r.status === "off day").length;
  const unauthorized = records.filter((r) => r.status === "unauthorized leave").length;
  const pending = records.filter((r) => r.status === "pending").length;

  const totalWorkDays = presentDays + authorizedLeave + unauthorized;
  const attendanceRatio =
    totalWorkDays > 0 ? Math.round((presentDays / totalWorkDays) * 100) : 0;

  return { presentDays, authorizedLeave, offDays, unauthorized, pending, attendanceRatio };
};



/**
 * 👨‍💼 Admin: Get All Attendance Records
 */
export const getAllAttendance = async (req, res) => {
  try {
    const records = await Attendance.find().sort({ date: -1, createdAt: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * 👨‍💼 Admin: Get Attendance Records (Advanced Pagination / Filtering)
 */
export const getAttendanceRecords = async (req, res) => {
  try {
    let { page = 1, limit = 20, startDate, endDate, status, userEmail } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const query = {};

    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      query.date = { $gte: startDate };
    } else if (endDate) {
      query.date = { $lte: endDate };
    }

    if (status) query.status = status;
    if (userEmail) query.userEmail = userEmail;

    const total = await Attendance.countDocuments(query);

    const records = await Attendance.find(query)
      .sort({ date: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      records,
    });
  } catch (err) {
    console.error("getAttendanceRecords error:", err);
    res.status(500).json({ message: err.message });
  }
};


/**
 * 🔍 Admin: Filter / Search Attendance by Date or Range and user email or name
 */
export const searchAttendance = async (req, res) => {
  try {
    const { startDate, endDate, date, email, name } = req.query;
    const userEmail = req.user.email;
    const user = await User.findOne({ email: userEmail });

    let query = {};

    if (user.role === "employee") {
      // Employees can only see their own records
      query.userEmail = userEmail;
    } else {
      // Admins can filter by email or name (partial case-insensitive)
      if (email) {
        query.userEmail = { $regex: email, $options: "i" };
      }
      if (name) {
        query.fullName = { $regex: name, $options: "i" };
      }
    }

    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    } else if (date) {
      query.date = date;
    }

    const records = await Attendance.find(query).sort({ date: -1 });
    res.json(records);
  } catch (err) {
    console.error("searchAttendance error:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * 👨‍💼 Admin: Manually Edit Attendance
 */
export const editAttendance = async (req, res) => {
  try {
    const { attendanceId, status, reason } = req.body;

    if (!attendanceId || !status) {
      return res.status(400).json({ message: "attendanceId and status required" });
    }

    const validStatuses = [
      "attended",
      "unauthorized leave",
      "authorized leave",
      "off day",
      "pending",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const record = await Attendance.findById(attendanceId);
    if (!record) return res.status(404).json({ message: "Attendance not found" });

    record.status = status;
    if (reason) record.reason = reason;
    await record.save();

    const io = req.app.get("io");
    io.emit("attendance-change", { userEmail: record.userEmail, status });

    res.json({ message: "Attendance status updated", record });
  } catch (err) {
    console.error("editAttendance error:", err);
    res.status(500).json({ message: err.message });
  }
};



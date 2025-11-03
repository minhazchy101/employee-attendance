import cron from "node-cron";
import Attendance from "../models/Attendance.js";

import Leave from "../models/Leave.js";
import User from "../models/User.js";

export const scheduleDailyAttendanceCheck = (io) => {
  cron.schedule("0 0 * * *", async () => { // every day at midnight
    const today = new Date().toISOString().slice(0, 10);
    const employees = await User.find({ role: "employee", status: "approved" });

    for (const emp of employees) {
      const existing = await Attendance.findOne({ userEmail: emp.email, date: today });
      if (existing) continue;

      let status = "unauthorized leave";

      // 1️⃣ Weekly Off
      const dayOfWeek = new Date().getDay(); // 0-6 (Sun-Sat)
      if (emp.weeklyOffDay === dayOfWeek) status = "off day";

      // 2️⃣ Approved Leave
      const approvedLeave = await Leave.findOne({
        employeeEmail: emp.email,
        status: "approved",
        startDate: { $lte: today },
        endDate: { $gte: today },
      });
      if (approvedLeave) status = "authorized leave";

      await Attendance.create({ userEmail: emp.email, date: today, status, method: "auto" });

      // 3️⃣ Notify via Socket.io
      io.emit("attendance-change", { userEmail: emp.email, status });
    }

    console.log(`[Cron] Attendance check completed for ${today}`);
  });
};

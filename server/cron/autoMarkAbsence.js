// autoMarkAbsence.js
import cron from "node-cron";
import Attendance from "../models/Attendance.js";
import User from "../models/User.js";

// Run every day at 6 PM
cron.schedule("0 18 * * *", async () => {
  try {
    console.log("Running cron job: Auto-mark unauthorized absences");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fetch all active employees
    const employees = await User.find({ role: "employee", isActive: true });

    for (const emp of employees) {
      // Check if attendance exists for today
      const attendanceExists = await Attendance.findOne({
        user: emp._id,
        date: today,
      });

      if (!attendanceExists) {
        // Check if employee has approved leave today
        const hasLeave = emp.leaves?.some(
          (leave) =>
            leave.status === "approved" &&
            leave.startDate <= today &&
            leave.endDate >= today
        );

        if (!hasLeave) {
          // Auto mark absence
          const newRecord = new Attendance({
            user: emp._id,
            date: today,
            status: "Absence",
            method: "auto",
          });
          await newRecord.save();
          console.log(`Marked absence for ${emp.email}`);
        }
      }
    }

    console.log("Cron job completed successfully.");
  } catch (err) {
    console.error("Cron job failed:", err.message);
  }
});

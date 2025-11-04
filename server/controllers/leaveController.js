import Leave from "../models/Leave.js";
import Attendance from "../models/Attendance.js";
import User from "../models/User.js";

/**
 * 🧍‍♂️ Employee: Submit Leave Request
 */
export const submitLeave = async (req, res) => {
  try {
    const userEmail = req.user?.email;
    if (!userEmail) return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findOne({ email: userEmail });
    if (!user || user.role !== "employee") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { reasonType, description, startDate, endDate } = req.body;
    if (!reasonType || !startDate || !endDate) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Prevent overlapping leave requests
    const overlap = await Leave.findOne({
      userEmail,
      $or: [
        { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
      ],
      status: { $in: ["pending", "approved"] },
    });
    if (overlap) return res.status(400).json({ message: "Leave overlaps with existing request." });

    const leave = new Leave({
      fullName: user.fullName,
      userEmail: user.email,
      reasonType,
      description: description || "",
      startDate,
      endDate,
      status: "pending",
    });

    await leave.save();

    const io = req.app.get("io");
    io.emit("leave-request", leave);

    res.status(201).json({ message: "Leave request submitted successfully.", leave });
  } catch (err) {
    console.error("submitLeave error:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * 👨‍💼 Admin: Get all leaves
 */
export const getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find().sort({ createdAt: -1 });
    res.json({ success: true, leaves });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 👨‍💼 Admin: Approve or Reject Leave
 */
export const updateLeaveStatus = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    const leave = await Leave.findById(leaveId);
    if (!leave) return res.status(404).json({ message: "Leave not found." });

    leave.status = status;
    await leave.save();

    // --- Side effects for approved leaves ---
    if (status === "approved") {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

      const promises = [];
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().slice(0, 10);
        promises.push(
          Attendance.findOneAndUpdate(
            { userEmail: leave.userEmail, date: dateStr },
            { status: "authorized leave", method: "leave-system" },
            { upsert: true, new: true }
          )
        );
      }
      await Promise.all(promises);

      // Deduct holiday balance if reasonType = "holiday"
      if (leave.reasonType === "holiday") {
        await User.findOneAndUpdate(
          { email: leave.userEmail, remainingHoliday: { $gte: days } },
          { $inc: { remainingHoliday: -days } }
        );
      }
    }

    const io = req.app.get("io");
    io.emit("leave-status-change", leave);


    res.json({ message: `Leave ${status} successfully.`, leave });
  } catch (err) {
    console.error("updateLeaveStatus error:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * 🧍‍♂️ Employee: Get My Leaves
 */
export const getMyLeaves = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const leaves = await Leave.find({ userEmail }).sort({ createdAt: -1 });
    res.json({ success: true, leaves });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

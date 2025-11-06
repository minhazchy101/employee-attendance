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

    // 🧮 Calculate total leave days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    if (totalDays <= 0) {
      return res.status(400).json({ message: "Invalid date range." });
    }

    // Prevent overlapping leave requests
    const overlap = await Leave.findOne({
      userEmail,
      $or: [{ startDate: { $lte: endDate }, endDate: { $gte: startDate } }],
      status: { $in: ["pending", "approved"] },
    });
    if (overlap)
      return res
        .status(400)
        .json({ message: "Leave overlaps with existing request." });

    // Create new leave record
    const leave = new Leave({
      fullName: user.fullName,
      userEmail: user.email,
      reasonType,
      description: description || "",
      startDate,
      endDate,
      totalDays, 
      status: "pending",
    });

    await leave.save();

    const io = req.app.get("io");
    io.emit("leave-request", leave);

    res.status(201).json({
      message: "Leave request submitted successfully.",
      leave,
    });
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

    // Skip if status is already the same
    if (leave.status === status) {
      return res.status(400).json({ message: `Leave is already ${status}` });
    }

    leave.status = status;
    await leave.save();

    const io = req.app.get("io");

    if (status === "approved") {
      const { startDate, endDate, totalDays, reasonType, userEmail } = leave;

      // Update attendance for each day
      const start = new Date(startDate);
      const end = new Date(endDate);
      const promises = [];
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().slice(0, 10);
        promises.push(
          Attendance.findOneAndUpdate(
            { userEmail, date: dateStr },
            {
              status: "authorized leave",
              method: "leave-system",
              reason: reasonType,
            },
            { upsert: true, new: true }
          )
        );
      }
      await Promise.all(promises);

      // Deduct remainingHoliday only if leave type is "holiday"
      if (reasonType === "holiday") {
        const user = await User.findOne({ email: userEmail });
        if (!user) return res.status(404).json({ message: "User not found." });

        if (user.remainingHoliday < totalDays) {
          // Optional: reject leave if insufficient holidays
          return res
            .status(400)
            .json({ message: "Insufficient remaining holidays." });
        }

        user.remainingHoliday -= totalDays;
        await user.save();
      }
    }

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

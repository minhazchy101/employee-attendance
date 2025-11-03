import Leave from "../models/Leave.js";
import Attendance from "../models/Attendance.js";
import User from "../models/User.js";

// 1️⃣ Employee: submit leave request
export const submitLeave = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    // Fetch user from DB to get fullName
    const user = await User.findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const { reasonType, description, startDate, endDate } = req.body;

    if (!reasonType || !startDate || !endDate)
      return res.status(400).json({ message: "Missing required fields" });

    const leave = new Leave({
      fullName: user.fullName, // now guaranteed
      userEmail: user.email,
      reasonType,
      description: description || "",
      startDate,
      endDate,
      status: "pending",
    });

    await leave.save();

    // Emit socket event
    const io = req.app.get("io");
    io.emit("leave-request", leave);

    res.status(201).json({ message: "Leave request submitted", leave });
  } catch (err) {
    console.error("submitLeave error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// 2️⃣ Admin: get all leave requests
export const getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find().sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 3️⃣ Admin: approve/reject leave
export const updateLeaveStatus = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { status } = req.body; // "approved" or "rejected"

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const leave = await Leave.findById(leaveId);
    if (!leave) return res.status(404).json({ message: "Leave not found" });

    leave.status = status;
    await leave.save();

    // Update attendance records if approved
    if (status === "approved") {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);

      for (
        let d = new Date(start);
        d <= end;
        d.setDate(d.getDate() + 1)
      ) {
        const dateStr = d.toISOString().slice(0, 10);

        // Create or update attendance as authorized leave
        await Attendance.findOneAndUpdate(
          { userEmail: leave.userEmail, date: dateStr },
          { status: "authorized leave", method: "leave-system" },
          { upsert: true, new: true }
        );
      }

      // Reduce holiday balance if holiday leave
      if (leave.reasonType === "holiday") {
       const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

await User.findOneAndUpdate(
  { email: leave.userEmail },
  { $inc: { remainingHoliday: -days } }
);

      }
    }

    // Emit socket event
    const io = req.app.get("io");
    io.emit("leave-status-change", { userEmail: leave.userEmail, status });

    res.json({ message: `Leave ${status}`, leave });
  } catch (err) {
    console.error("updateLeaveStatus error:", err);
    res.status(500).json({ message: err.message });
  }
};

// 4️⃣ Employee: get my leaves
export const getMyLeaves = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const leaves = await Leave.find({ userEmail }).sort({ createdAt: -1 });
    res.json({ success: true, leaves }); // <- safer structure
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, leaves: [] });
  }
};


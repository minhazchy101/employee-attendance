import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    userEmail: {
      type: String,
      required: true,
    },
    date: {
      type: String, // e.g. "2025-10-28"
      required: true,
    },
    status: {
      type: String,
      enum: ["Attend", "Absence"],
      required: true,
    },
    method: {
      type: String, // "manual" | "auto"
      default: "manual",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Attendance", attendanceSchema);

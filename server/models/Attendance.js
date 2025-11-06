import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    userEmail: {
      type: String,
      required: true,
      
      trim: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: String, // format: YYYY-MM-DD
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "attended",
        "unauthorized leave",
        "off day",
        "authorized leave",
      ],
      required: true,
    },
    reason: {
      type: String,
      trim: true, // e.g., "holiday", "sick", "other", or "Weekly off"
    },
    method: {
      type: String,
      required: true, // "manual" | "auto" | "leave-system"
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a unique record per employee per date
attendanceSchema.index({ userEmail: 1, date: 1 }, { unique: true });

export default mongoose.model("Attendance", attendanceSchema);

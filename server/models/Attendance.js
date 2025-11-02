import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    userEmail: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Attend", "Absence"],
      required: true,
    },
    method: {
      type: String, 
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Attendance", attendanceSchema);

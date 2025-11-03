import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  date: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "attended", "unauthorized leave", "off day", "authorized leave"],
    required: true,
  },
  method: { type: String, required: true }, // manual / auto
}, { timestamps: true });

export default mongoose.model("Attendance", attendanceSchema);

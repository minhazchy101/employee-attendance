import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema(
  {
    userEmail: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    reasonType: {
      type: String,
      enum: ["holiday", "sick", "other"],
      required: true,
    },
    description: { type: String, default: "" },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Leave", leaveSchema);

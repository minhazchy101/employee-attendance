import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema(
  {
    userEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    reasonType: {
      type: String,
      enum: ["holiday", "sick", "other"],
      required: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true, // createdAt and updatedAt
  }
);

// Optional: add index for quick queries
leaveSchema.index({ userEmail: 1, startDate: 1, endDate: 1 });

export default mongoose.model("Leave", leaveSchema);

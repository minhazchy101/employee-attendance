// models/User.js
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    image: { type: String, default: "" },
    email: { type: String, unique: true, required: true, lowercase: true },
    phoneNumber: { type: String, required: true },
    niNumber: { type: String, required: true }, 

    role: {
      type: String,
      enum: ["pending request", "employee", "admin"],
      default: "pending request",
    },
    jobTitle: { type: String, required: true },
    status: { type: String, default: "pending" },
    joinDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
export default User;

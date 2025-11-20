import mongoose from "mongoose";

const EmergencyContactSchema = new mongoose.Schema({
 fullName: { type: String, required: true },
relationship: { type: String, required: true },
address: { type: String, required: true },
townCity: { type: String, required: true },
postcode: { type: String, required: true },
contactNumber: { type: String, required: true },
email: { type: String, required: true },

});

const UserSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    image: { type: String, default: "" },
    email: { type: String, required: true, unique: true, lowercase: true },
    phoneNumber: { type: String},
    niNumber: { type: String},

    role: {
      type: String,
      enum: ["pending request", "employee", "admin"],
      default: "pending request",
    },

    status: {
      type: String,
      enum: ["waiting for approval", "active"],
      default: "waiting for approval",
    },

    remainingHoliday: { type: Number, default: 28 },

    jobTitle: { type: String },
    joinDate: { type: Date, default: Date.now },

    // Extended fields
    address: { type: String },
    passportNumber: { type: String },
    passportExpireDate: { type: Date },
    jobStartDate: { type: Date },
    weeklyHours: { type: Number },
    hourlyRate: { type: Number },
    annualWages: { type: Number },
    offDay: { type: String, default: "Not Assigned" },
    emergencyContacts: [EmergencyContactSchema],

   
    sponsorshipLicenseNumber: { type: String, default: "" },
    sponsorDocuments: { type: [String], default: [] },

    isProfileComplete: { type: Boolean, default: false },
  },
  { timestamps: true }
);


export default mongoose.model("User", UserSchema);

import mongoose from "mongoose";

const holidaySchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g., "Eid"
    date: { type: String, required: true }, // YYYY-MM-DD
    description: { type: String, default: "" }, // optional note
  },
  { timestamps: true }
);

const Holiday = mongoose.model("Holiday", holidaySchema);
export default Holiday;

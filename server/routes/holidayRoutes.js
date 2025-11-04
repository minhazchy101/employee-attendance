import express from "express";
import Holiday from "../models/Holiday.js";
import { verifyAdmin } from "../middleware/auth.js";

const holidayRouter = express.Router();

/* ============================================
   🟢 Get all holidays (Admin only)
============================================ */
holidayRouter.get("/", verifyAdmin, async (req, res) => {
  try {
    const holidays = await Holiday.find().sort({ date: 1 });
    res.json({ success: true, holidays });
  } catch (err) {
    console.error(" Error fetching holidays:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ============================================
   🟣 Add a new holiday
============================================ */
holidayRouter.post("/add", verifyAdmin, async (req, res) => {
  try {
    const { name, date, description } = req.body;
    if (!name || !date)
      return res.status(400).json({ message: "Name and date are required" });

    // Prevent duplicates
    const existing = await Holiday.findOne({ date });
    if (existing)
      return res
        .status(400)
        .json({ message: "Holiday already exists on this date" });

    const holiday = await Holiday.create({ name, date, description });

    //  Emit socket event for real-time update
    const io = req.app.get("io");
    io.emit("holiday-change", { type: "added", holiday });

    res.status(201).json({
      success: true,
      message: "Holiday added successfully",
      holiday,
    });
  } catch (err) {
    console.error(" Error adding holiday:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ============================================
   🔴 Delete a holiday
============================================ */
holidayRouter.delete("/:id", verifyAdmin, async (req, res) => {
  try {
    const holiday = await Holiday.findByIdAndDelete(req.params.id);
    if (!holiday)
      return res.status(404).json({ message: "Holiday not found" });

    //  Emit socket event for real-time update
    const io = req.app.get("io");
    io.emit("holiday-change", { type: "deleted", id: req.params.id });

    res.json({
      success: true,
      message: "Holiday deleted successfully",
      holiday,
    });
  } catch (err) {
    console.error("Error deleting holiday:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default holidayRouter;

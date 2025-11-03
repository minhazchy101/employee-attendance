import cron from "node-cron";
import User from "../models/User.js";

// Reset remainingHoliday every April 6
cron.schedule("0 0 6 4 *", async () => {
  console.log("Resetting all employee holidays to 28...");
  await User.updateMany({ role: "employee" }, { remainingHoliday: 28 });
});

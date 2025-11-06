// utils/holidayUtils.js
import Holiday from "../models/Holiday.js";
import User from "../models/User.js";


/**
 * Apply a single holiday to all employees
 * Deduct 1 day from remainingHoliday for all employees if > 0
 */
// export const applyHolidayToUsers = async (holidayDate) => {

//   try {
//     const users = await User.find({ role: "employee" });

//     const promises = users.map(async (user) => {
//       if (user.remainingHoliday > 0) {
//         user.remainingHoliday -= 1;
//         if (user.remainingHoliday < 0) user.remainingHoliday = 0;
//         await user.save();
//       }
//     });

//     await Promise.all(promises);
//     console.log(`Applied holiday ${holidayDate} to all employees`);
//   } catch (err) {
//     console.error("applyHolidayToUsers error:", err);
//   }
// };


export const applyHolidayToUsers = async (date) => {
  await User.updateMany(
    { role: "employee" },
    { $inc: { remainingHoliday: -1 } }
  );
};

export const revertHolidayFromUsers = async (date) => {
  await User.updateMany(
    { role: "employee" },
    { $inc: { remainingHoliday: 1 } }
  );
};
 
/**
 * Apply all holidays from DB (e.g., at server startup)
 */
export const applyAllHolidays = async () => {
  try {
    const holidays = await Holiday.find({});
    for (const holiday of holidays) {
      await applyHolidayToUsers(holiday.date);
    }
    console.log("All global holidays applied to employees");
  } catch (err) {
    console.error("applyAllHolidays error:", err);
  }
};

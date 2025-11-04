import React, { useEffect, useState, useMemo } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import { useAppContext } from "../../../context/AppContext";
import { usePolish } from "../../../hooks/usePolish";
import PageHeader from "../../../components/reusable/PageHeader";
import LoadingSpinner from "../../../components/reusable/LoadingSpinner";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const STATUS_OPTIONS = ["All", "Attend", "Absent"];

const EmployeeAttendanceCalendar = () => {
  const { token } = useAppContext();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  // Filter states
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth());
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [filterStatus, setFilterStatus] = useState("All");

  // Fetch attendance records
  const fetchMyAttendance = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/attendance/my`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRecords(data.records || []);
    } catch (err) {
      console.error("Error fetching attendance:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchMyAttendance();
  }, [token]);

  // Apply filters on records
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      const dateObj = new Date(rec.date);
      if (dateObj.getMonth() !== filterMonth) return false;
      if (dateObj.getFullYear() !== filterYear) return false;
      if (filterStatus !== "All" && rec.status !== filterStatus) return false;
      return true;
    });
  }, [records, filterMonth, filterYear, filterStatus]);

  // Map filtered records for quick lookup by date string YYYY-MM-DD
  const recordMap = useMemo(() => {
    const map = {};
    filteredRecords.forEach((rec) => {
      map[rec.date] = rec;
    });
    return map;
  }, [filteredRecords]);

  usePolish({
    "attendance-update": (updatedRecord) => {
      setRecords((prev) => {
        const idx = prev.findIndex((r) => r._id === updatedRecord._id);
        if (idx !== -1) {
          const copy = [...prev];
          copy[idx] = updatedRecord;
          return copy;
        }
        return [...prev, updatedRecord];
      });
    },
  });

  // Calendar tile styling
  const tileClassName = ({ date, view }) => {
    if (view !== "month") return "";

    const dayStr = date.toISOString().split("T")[0];
    const record = recordMap[dayStr];

    if (!record) return "";

    return record.status === "Attend"
      ? "bg-primary/20 text-primary font-semibold rounded-full"
      : "bg-red-200 text-red-600 font-semibold rounded-full";
  };

  // Highlight selected day with a ring
  const tileContent = ({ date, view }) => {
    if (view !== "month" || !selectedDate) return null;

    const isSelected =
      date.toISOString().split("T")[0] ===
      selectedDate.toISOString().split("T")[0];

    return isSelected ? (
      <div className="absolute inset-0 rounded-full ring-2 ring-primary pointer-events-none"></div>
    ) : null;
  };

  // Year options from 3 years before to 3 years after current year
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let y = currentYear - 3; y <= currentYear + 3; y++) yearOptions.push(y);

  // When user changes month/year filter, update selectedDate to first day of that month to reflect calendar view
  useEffect(() => {
    setSelectedDate(new Date(filterYear, filterMonth, 1));
  }, [filterMonth, filterYear]);

  // When clicking a day outside the filter month/year, reset filters accordingly
  const handleDayClick = (date) => {
    setSelectedDate(date);
    setFilterMonth(date.getMonth());
    setFilterYear(date.getFullYear());
  };

  const selectedRecord = selectedDate
    ? recordMap[selectedDate.toISOString().split("T")[0]]
    : null;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="My Attendance Calendar"
        subtitle="View your attendance by date and check details"
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mt-4 items-center">
        <label className="flex flex-col text-secondary text-sm font-medium">
          Month
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(Number(e.target.value))}
            className="mt-1 rounded border border-gray-300 p-2 text-base focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {MONTHS.map((m, i) => (
              <option key={m} value={i}>
                {m}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col text-secondary text-sm font-medium">
          Year
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(Number(e.target.value))}
            className="mt-1 rounded border border-gray-300 p-2 text-base focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col text-secondary text-sm font-medium">
          Status
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="mt-1 rounded border border-gray-300 p-2 text-base focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] py-16 text-secondary">
          <LoadingSpinner size="lg" className="mb-3" />
          <span>Loading attendance records...</span>
        </div>
      ) : (
        <div className="mt-8 flex flex-col md:flex-row gap-10">
          {/* Calendar */}
          <div className="relative w-full max-w-sm md:max-w-md shadow-lg rounded-lg overflow-hidden">
            <Calendar
           calendarType="iso8601"
              onClickDay={handleDayClick}
              value={selectedDate || new Date(filterYear, filterMonth, 1)}
              tileClassName={tileClassName}
              tileContent={tileContent}
              nextLabel="›"
              prevLabel="‹"
              next2Label="»"
              prev2Label="«"
              showNeighboringMonth={false}
              activeStartDate={new Date(filterYear, filterMonth, 1)}
            />
          </div>

          {/* Detail Panel */}
          <div className="flex-1 bg-white shadow-lg rounded-lg p-6 min-h-[220px]">
            {selectedRecord ? (
              <>
                <h2 className="text-xl font-semibold mb-3 text-primary">
                  {new Date(selectedRecord.date).toLocaleDateString(undefined, {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </h2>

                <p className="mb-2">
                  <span className="font-semibold">Status: </span>
                  <span
                    className={`font-semibold ${
                      selectedRecord.status === "Attend"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {selectedRecord.status}
                  </span>
                </p>

                <p>
                  <span className="font-semibold">Method: </span>
                  <span className="text-secondary">{selectedRecord.method}</span>
                </p>
              </>
            ) : (
              <p className="text-secondary italic select-none">
                Click on a day to view attendance details
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeAttendanceCalendar;

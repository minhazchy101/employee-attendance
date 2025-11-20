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

const STATUS_OPTIONS = ["All", "Attend", "Absent", "authorized leave"];

const formatDate = (date) => {
  const d = new Date(date);
  if (isNaN(d)) return null; // Guard against invalid date
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Reusable Filter Component
const Filter = ({ label, value, options, onChange }) => (
  <label className="flex flex-col text-gray-600 text-sm font-medium flex-1 min-w-[120px]">
    {label}
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mt-1 rounded border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {options.map((opt, i) =>
        typeof opt === "string" ? (
          <option key={opt} value={i}>
            {opt}
          </option>
        ) : (
          <option key={opt} value={i}>
            {opt}
          </option>
        )
      )}
    </select>
  </label>
);

const EmployeeAttendanceCalendar = () => {
  const { token } = useAppContext();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const today = new Date();

  // Filters
  const [filterMonth, setFilterMonth] = useState(today.getMonth());
  const [filterYear, setFilterYear] = useState(today.getFullYear());
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedDate, setSelectedDate] = useState(today);

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

  // Ensure filterMonth and filterYear are numbers
  const numericMonth = Number(filterMonth);
  const numericYear = Number(filterYear);

  // Selected start date for the calendar view
  const calendarStartDate = useMemo(
    () => new Date(numericYear, numericMonth, 1),
    [numericMonth, numericYear]
  );

  // Update selected date when filters change
  useEffect(() => {
    const isCurrentMonth = numericMonth === today.getMonth() && numericYear === today.getFullYear();
    setSelectedDate(isCurrentMonth ? today : new Date(numericYear, numericMonth, 1));
  }, [numericMonth, numericYear]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      const dateObj = new Date(rec.date);
      if (isNaN(dateObj)) return false;
      if (dateObj.getMonth() !== numericMonth) return false;
      if (dateObj.getFullYear() !== numericYear) return false;
      if (filterStatus !== "All" && rec.status !== filterStatus) return false;
      return true;
    });
  }, [records, numericMonth, numericYear, filterStatus]);

  const recordMap = useMemo(() => {
    const map = {};
    filteredRecords.forEach((rec) => {
      const dayStr = formatDate(rec.date);
      if (dayStr) map[dayStr] = rec;
    });
    return map;
  }, [filteredRecords]);

  const handleDayClick = (date) => {
    setSelectedDate(date);
    setFilterMonth(date.getMonth());
    setFilterYear(date.getFullYear());
  };

  const tileContent = ({ date, view }) => {
    if (view !== "month") return null;
    const isSelected = selectedDate && formatDate(date) === formatDate(selectedDate);
    return isSelected ? (
      <div className="absolute inset-0 rounded-lg ring-2 ring-blue-500 pointer-events-none"></div>
    ) : null;
  };

  const currentYear = today.getFullYear();
  const yearOptions = [];
  for (let y = currentYear - 3; y <= currentYear + 3; y++) yearOptions.push(y);

  const selectedRecord = selectedDate ? recordMap[formatDate(selectedDate)] : null;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto font-sans">
      <PageHeader
        title="My Attendance Calendar"
        subtitle="View your attendance by date and check details"
      />

      <div className="flex flex-wrap gap-4 mt-4 items-center">
        <Filter label="Month" value={numericMonth} options={MONTHS} onChange={setFilterMonth} />
        <Filter label="Year" value={numericYear} options={yearOptions} onChange={setFilterYear} />
        <Filter label="Status" value={filterStatus} options={STATUS_OPTIONS} onChange={setFilterStatus} />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] py-16 text-gray-500">
          <LoadingSpinner size="lg" className="mb-3" />
          <span>Loading attendance records...</span>
        </div>
      ) : (
        <div className="mt-8 flex flex-col lg:flex-row gap-8">
          <div className="w-9/12 lg:w-1/3 mx-auto shadow-lg border-green-200 bg-white overflow-hidden rounded-lg border-4">
            <Calendar
              calendarType="iso8601"
              onClickDay={handleDayClick}
              value={selectedDate}
              tileContent={tileContent}
              nextLabel="›"
              prevLabel="‹"
              next2Label="»"
              prev2Label="«"
              showNeighboringMonth={false}
              activeStartDate={calendarStartDate}
              className="w-full"
            />
          </div>

          <div className="flex-1 w-9/12 lg:w-1/3 mx-auto bg-white shadow-md rounded-lg p-6 border border-gray-100 min-h-[250px]">
            {selectedRecord ? (
              <>
                <h2 className="text-xl font-semibold mb-3 text-gray-800">
                  {new Date(selectedRecord.date).toLocaleDateString(undefined, {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </h2>

                <div className="flex flex-col gap-2">
                  <p>
                    <span className="font-semibold">Status: </span>
                    <span
                      className={`font-semibold ${
                        selectedRecord.status === "Attend"
                          ? "text-green-600"
                          : selectedRecord.status === "authorized leave"
                          ? "text-red-600"
                          : "text-gray-700"
                      }`}
                    >
                      {selectedRecord.status}
                    </span>
                  </p>

                  {selectedRecord.status === "authorized leave" && selectedRecord.reason && (
                    <p>
                      <span className="font-semibold">Reason: </span>
                      <span className="text-gray-600">{selectedRecord.reason}</span>
                    </p>
                  )}

                  <p>
                    <span className="font-semibold">Method: </span>
                    <span className="text-gray-600">{selectedRecord.method}</span>
                  </p>
                </div>
              </>
            ) : (
              <p className="text-gray-400 italic select-none">
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

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAppContext } from "../../context/AppContext";
import PageHeader from "../../components/reusable/PageHeader";
import LoadingSpinner from "../../components/reusable/LoadingSpinner";

const AttendanceHistory = () => {
  const { token } = useAppContext();
  const [records, setRecords] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchMyAttendance = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/attendance/my`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRecords(data);
      setFiltered(data);
    } catch (err) {
      console.error("Error fetching attendance:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter records based on date range
  const handleFilter = () => {
    if (!startDate && !endDate) {
      setFiltered(records);
      return;
    }

    const filteredData = records.filter((rec) => {
      const recDate = new Date(rec.date);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      if (start && end)
        return recDate >= start && recDate <= end;
      if (start)
        return recDate >= start;
      if (end)
        return recDate <= end;

      return true;
    });

    setFiltered(filteredData);
  };

  const clearFilter = () => {
    setStartDate("");
    setEndDate("");
    setFiltered(records);
  };

  useEffect(() => {
    if (token) fetchMyAttendance();
  }, [token]);

  return (
    <div className="p-6">
      <PageHeader
        title="My Attendance History"
        subtitle="Track and filter your daily attendance records."
      />

      {/* 🔍 Filter Section */}
      <div className="bg-white shadow-md rounded-lg p-4 mt-6 flex flex-col sm:flex-row gap-4 sm:items-end">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            From Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            To Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex gap-3 sm:ml-auto">
          <button
            onClick={handleFilter}
            className="bg-secondary text-white px-5 py-2 rounded-md hover:bg-secondary/80 transition"
          >
            Apply
          </button>
          <button
            onClick={clearFilter}
            className="bg-primary/10 text-primary px-5 py-2 rounded-md hover:bg-primary/20 transition"
          >
            Clear
          </button>
        </div>
      </div>

      {/* 🧾 Attendance Table / Cards */}
      <div className="bg-white shadow-md rounded-lg mt-6 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <LoadingSpinner size="lg" className="mb-3" />
            <span>Loading attendance records...</span>
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center py-10 text-gray-500">
            No attendance records found.
          </p>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-primary text-white">
                  <tr>
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Method</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((rec, idx) => (
                    <tr
                      key={rec._id}
                      className="border-b border-gray-100 hover:bg-primary/5 transition"
                    >
                      <td className="px-4 py-3 text-gray-700">{idx + 1}</td>
                      <td className="px-4 py-3 text-gray-800">
                        {new Date(rec.date).toLocaleDateString()}
                      </td>
                      <td
                        className={`px-4 py-3 font-semibold ${
                          rec.status === "Attend"
                            ? "text-green-600"
                            : "text-red-500"
                        }`}
                      >
                        {rec.status}
                      </td>
                      <td className="px-4 py-3 capitalize text-gray-700">
                        {rec.method}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4 p-3">
              {filtered.map((rec, idx) => (
                <div
                  key={rec._id}
                  className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-600">
                      #{idx + 1}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded ${
                        rec.status === "Attend"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {rec.status}
                    </span>
                  </div>
                  <p className="text-gray-800 font-medium">
                    {new Date(rec.date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500 capitalize mt-1">
                    Method: {rec.method}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AttendanceHistory;

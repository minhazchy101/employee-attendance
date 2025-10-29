import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAppContext } from "../../../context/AppContext";
import { usePolish } from "../../../hooks/usePolish";
import PageHeader from "../../../components/reusable/PageHeader";

const AdminAttendanceTable = () => {
  const { token } = useAppContext();
  const [records, setRecords] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch all attendance
  const fetchAllAttendance = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/attendance/all`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRecords(data);
      setFiltered(data);
    } catch (err) {
      console.error("Error fetching all attendance:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchAllAttendance();
  }, [token]);

  // Real-time auto refresh
  usePolish({
    "attendance-change": () => fetchAllAttendance(),
    "user-change": () => fetchAllAttendance(),
  });

  // Filtering logic
  useEffect(() => {
    let filteredData = [...records];

    if (search) {
      filteredData = filteredData.filter(
        (rec) =>
          rec.userEmail?.toLowerCase().includes(search.toLowerCase()) ||
          rec.userName?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (date) {
      filteredData = filteredData.filter((rec) => rec.date === date);
    }

    setFiltered(filteredData);
  }, [search, date, records]);

  return (
    <div className="p-6">
      <PageHeader
        title="Attendance Management"
        subtitle="View all employees' attendance records."
      />

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by name or email"
          className="border px-3 py-2 rounded-md focus:ring w-full md:w-1/3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input
          type="date"
          className="border px-3 py-2 rounded-md focus:ring w-full md:w-1/4"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <button
          onClick={() => {
            setSearch("");
            setDate("");
          }}
          className="bg-gray-200 hover:bg-gray-300 text-sm px-3 py-2 rounded-md"
        >
          Clear Filters
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-2">#</th>
              <th className="px-4 py-2">Employee Email</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Method</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : filtered.length > 0 ? (
              filtered.map((rec, idx) => (
                <tr
                  key={rec._id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-2">{idx + 1}</td>
                  <td className="px-4 py-2">{rec.userEmail}</td>
                  <td className="px-4 py-2">{rec.date}</td>
                  <td
                    className={`px-4 py-2 font-medium ${
                      rec.status === "Attend"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {rec.status}
                  </td>
                  <td className="px-4 py-2 capitalize">{rec.method}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-500">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminAttendanceTable;

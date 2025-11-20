import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useAppContext } from "../../../context/AppContext";
import { usePolish } from "../../../hooks/usePolish";
import LoadingSpinner from "../../../components/reusable/LoadingSpinner";
import PageHeader from "../../../components/reusable/PageHeader";

const STATUS_OPTIONS = [
  "pending",
  "attended",
  "authorized leave",
  "unauthorized leave",
  "off day",
];

const AdminAttendanceDashboard = () => {
  const { token } = useAppContext();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [searchDates, setSearchDates] = useState({ startDate: "", endDate: "" });

  const today = new Date().toISOString().slice(0, 10);

  // Fetch today's attendance only
  const fetchTodayAttendance = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/attendance/search`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { date: today },
        }
      );
      setAttendance(data);
    } catch (err) {
      console.error("Failed to fetch today's attendance:", err);
    } finally {
      setLoading(false);
    }
  };

  // Search attendance records (full collection with extended filters)
  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = {};

      // If searchQuery exists, decide if email or name param
      if (searchQuery.trim()) {
        if (searchQuery.includes("@")) {
          // Probably an email, search by email (partial match)
          params.email = searchQuery.trim();
        } else {
          // Otherwise, search by fullName (partial match)
          params.name = searchQuery.trim();
        }
      }

      // Handle date filters
      if (searchDates.startDate && searchDates.endDate) {
        params.startDate = searchDates.startDate;
        params.endDate = searchDates.endDate;
      } else if (searchDates.startDate && !searchDates.endDate) {
        // Single date search (using startDate as date)
        params.date = searchDates.startDate;
      } else if (!searchDates.startDate && searchDates.endDate) {
        // If only endDate provided, treat it as single date search too
        params.date = searchDates.endDate;
      }

      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/attendance/search`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        }
      );
      setAttendance(data);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchTodayAttendance();
  }, [token]);

  // Real-time updates
  usePolish({
    "attendance-change": ({ userEmail, status }) => {
      setAttendance((prev) =>
        prev.map((rec) =>
          rec.userEmail === userEmail ? { ...rec, status } : rec
        )
      );
    },
  });

  // Confirm status change
  const handleConfirm = async (recordId) => {
    const newStatus = selectedStatus[recordId];
    if (!newStatus) {
      Swal.fire({
        icon: "warning",
        title: "Select a status",
        text: "Please choose a new status before confirming.",
        confirmButtonColor: "#f59e0b",
      });
      return;
    }

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/attendance/edit`,
        { attendanceId: recordId, status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire({
        icon: "success",
        title: "Attendance Updated",
        text: `Status changed to ${newStatus}`,
        showConfirmButton: false,
        timer: 1500,
      });

      setSelectedStatus((prev) => ({ ...prev, [recordId]: "" }));
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: err?.response?.data?.message || "Something went wrong",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500">
        <LoadingSpinner size="lg" className="mb-3" />
        <p>Loading attendance...</p>
      </div>
    );

  return (
    <div className="p-6">
      <PageHeader
        title="Employee Attendance"
        subtitle="Manage and confirm attendance statuses"
      />

      {/* Search Bar */}
      <div className="mb-4 flex flex-col md:flex-row gap-2">
        <input
          type="text"
          placeholder="Search by email or name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="border px-3 py-2 rounded-md w-full md:w-1/3"
        />
        <input
          type="date"
          value={searchDates.startDate}
          onChange={(e) =>
            setSearchDates((prev) => ({ ...prev, startDate: e.target.value }))
          }
          className="border px-3 py-2 rounded-md w-full md:w-1/6"
        />
        <input
          type="date"
          value={searchDates.endDate}
          onChange={(e) =>
            setSearchDates((prev) => ({ ...prev, endDate: e.target.value }))
          }
          className="border px-3 py-2 rounded-md w-full md:w-1/6"
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition"
        >
          Search
        </button>
        <button
          onClick={() => {
            setSearchQuery("");
            setSearchDates({ startDate: "", endDate: "" });
            fetchTodayAttendance();
          }}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition"
        >
          Clear
        </button>
      </div>

      {attendance.length === 0 ? (
        <p className="text-center py-10 text-gray-500">
          No attendance records found.
        </p>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left border-collapse">
                <thead className="bg-primary text-white">
                  <tr>
                    <th className="px-4 py-3 w-10">#</th>
                    <th className="px-4 py-3">Employee</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Current Status</th>
                    <th className="px-4 py-3">Update Status</th>
                    <th className="px-4 py-3 text-center w-40">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((rec, i) => (
                    <tr
                      key={rec._id}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="px-4 py-3 text-gray-700">{i + 1}</td>
                      <td className="px-4 py-3">{rec.userEmail}</td>
                      <td className="px-4 py-3">{rec.date}</td>
                      <td className="px-4 py-3">{rec.status}</td>
                      <td className="px-4 py-3">
                        <select
                          value={selectedStatus[rec._id] || ""}
                          onChange={(e) =>
                            setSelectedStatus((prev) => ({
                              ...prev,
                              [rec._id]: e.target.value,
                            }))
                          }
                          className="border border-gray-300 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="">Select for Update</option>
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleConfirm(rec._id)}
                          className="px-3 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition text-xs font-medium"
                          disabled={!selectedStatus[rec._id]}
                        >
                          Confirm
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-5">
            {attendance.map((rec, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 p-5"
              >
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      {rec.userEmail}
                    </h3>
                    <p className="text-sm text-gray-600">{rec.date}</p>
                    <p className="text-xs text-gray-400">Status: {rec.status}</p>
                  </div>
                </div>

                <div className="mt-3">
                  <select
                    value={selectedStatus[rec._id] || ""}
                    onChange={(e) =>
                      setSelectedStatus((prev) => ({
                        ...prev,
                        [rec._id]: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary transition"
                  >
                    <option value="">Select Status</option>
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => handleConfirm(rec._id)}
                    className="mt-3 w-full px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition"
                    disabled={!selectedStatus[rec._id]}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminAttendanceDashboard;

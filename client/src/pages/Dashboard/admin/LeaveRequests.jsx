import React, { useEffect, useState } from "react";
import { useAppContext } from "../../../context/AppContext";
import { usePolish } from "../../../hooks/usePolish";
import PageHeader from "../../../components/reusable/PageHeader";
import LoadingSpinner from "../../../components/reusable/LoadingSpinner";
import { FaCalendarCheck } from "react-icons/fa";

const LeaveRequests = () => {
  const { axios, token } = useAppContext();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // Fetch all leave requests
  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/leave/all`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setLeaves(Array.isArray(data) ? data : data.leaves || []);
    } catch (err) {
      console.error("Failed to fetch leave requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  // 🔁 Real-time socket updates
  usePolish({
    "leave-request": (newLeave) =>
      setLeaves((prev) => [newLeave, ...prev]),
    "leave-status-change": (updatedLeave) =>
      setLeaves((prev) =>
        prev.map((l) => (l._id === updatedLeave._id ? updatedLeave : l))
      ),
  });

  // Handle approval / rejection
  const handleStatusChange = async (id, status) => {
    setActionLoading(id + status);
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/leave/update/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // The socket will handle state update automatically
    } catch (err) {
      console.error("Error updating leave status:", err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <PageHeader
        title="Leave Requests"
        subtitle="Manage and approve employee leave requests"
        icon={<FaCalendarCheck className="text-blue-600" />}
      />

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <LoadingSpinner text="Loading leave requests..." />
        </div>
      ) : leaves.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-500 text-sm">
            No leave requests found.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white border border-gray-100 rounded-lg shadow-sm">
          <table className="w-full text-sm text-gray-700">
            <thead className="bg-gray-50 border-b text-gray-600">
              <tr>
                <th className="py-3 px-4 text-left">Employee</th>
                <th className="py-3 px-4 text-left">Reason</th>
                <th className="py-3 px-4 text-left">Description</th>
                <th className="py-3 px-4 text-left">Start</th>
                <th className="py-3 px-4 text-left">End</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((leave) => (
                <tr
                  key={leave._id}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-4 font-medium">{leave.userEmail}</td>
                  <td className="py-3 px-4 capitalize">{leave.reasonType}</td>
                  <td className="py-3 px-4">{leave.description || "—"}</td>
                  <td className="py-3 px-4">
                    {new Date(leave.startDate).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    {new Date(leave.endDate).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        leave.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : leave.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {leave.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {leave.status === "pending" ? (
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() =>
                            handleStatusChange(leave._id, "approved")
                          }
                          disabled={actionLoading === leave._id + "approved"}
                          className={`btn-primary px-3 py-1 text-xs ${
                            actionLoading === leave._id + "approved"
                              ? "opacity-60 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          {actionLoading === leave._id + "approved"
                            ? "Approving..."
                            : "Approve"}
                        </button>
                        <button
                          onClick={() =>
                            handleStatusChange(leave._id, "rejected")
                          }
                          disabled={actionLoading === leave._id + "rejected"}
                          className={`btn-secondary px-3 py-1 text-xs ${
                            actionLoading === leave._id + "rejected"
                              ? "opacity-60 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          {actionLoading === leave._id + "rejected"
                            ? "Rejecting..."
                            : "Reject"}
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LeaveRequests;

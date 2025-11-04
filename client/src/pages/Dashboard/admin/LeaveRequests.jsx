import React, { useEffect, useState } from "react";
import { useAppContext } from "../../../context/AppContext";
import { usePolish } from "../../../hooks/usePolish";
import PageHeader from "../../../components/reusable/PageHeader";
import LoadingSpinner from "../../../components/reusable/LoadingSpinner";
import { FaCalendarCheck, FaEnvelope, FaUser } from "react-icons/fa";
import Swal from "sweetalert2";
import axios from "axios";

const LeaveRequests = () => {
  const {  token } = useAppContext();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/leave/all`,
        { headers: { Authorization: `Bearer ${token}` } }
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

  usePolish({
    "leave-request": (newLeave) => setLeaves((prev) => [newLeave, ...prev]),
    "leave-status-change": (updatedLeave) =>
      setLeaves((prev) =>
        prev.map((l) => (l._id === updatedLeave._id ? updatedLeave : l))
      ),
  });

 const handleStatusChange = async (id, status) => {
  const confirm = await Swal.fire({
    title: `Are you sure?`,
    text: `Do you want to ${status} this leave request?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: `Yes, ${status}`,
    cancelButtonText: "Cancel",
    confirmButtonColor: status === "approved" ? "#22c55e" : "#ef4444",
  });

  if (!confirm.isConfirmed) return;

  setActionLoading(id + status);

  try {
    const { data: updatedLeave } = await axios.patch(
      `${import.meta.env.VITE_API_URL}/api/leave/update/${id}`,
      { status },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Update local state immediately for real-time UI
    setLeaves((prev) =>
      prev.map((l) => (l._id === updatedLeave._id ? updatedLeave : l))
    );

    // Emit the event to other clients (via your usePolish system)
    if (window.polish) {
      window.polish.emit("leave-status-change", updatedLeave);
    }

    Swal.fire("Updated!", `Leave has been ${status}.`, "success");
  } catch (err) {
    console.error("Error updating leave status:", err);
    Swal.fire("Error!", "Something went wrong.", "error");
  } finally {
    setActionLoading(null);
  }
};

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <PageHeader
        title="Leave Requests"
        subtitle="Manage and approve employee leave requests"
        icon={<FaCalendarCheck className="text-blue-600" />}
      />

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner text="Loading leave requests..." />
        </div>
      ) : leaves.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-10 text-center">
          <p className="text-gray-500 text-sm">No leave requests found.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-md">
            <table className="w-full text-sm text-gray-700">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="py-3 px-4 text-left font-medium">Employee</th>
                  <th className="py-3 px-4 text-left font-medium">Reason</th>
                  <th className="py-3 px-4 text-left font-medium">Description</th>
                  <th className="py-3 px-4 text-left font-medium">Start</th>
                  <th className="py-3 px-4 text-left font-medium">End</th>
                  <th className="py-3 px-4 text-center font-medium">Status</th>
                  <th className="py-3 px-4 text-center font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((leave) => (
                  <tr
                    key={leave._id}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4 font-medium">{leave.fullName}</td>
                    <td className="py-3 px-4 capitalize">{leave.reasonType}</td>
                    <td className="py-3 px-4">{leave.description || "—"}</td>
                    <td className="py-3 px-4">{new Date(leave.startDate).toLocaleDateString()}</td>
                    <td className="py-3 px-4">{new Date(leave.endDate).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          leave.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : leave.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {leave.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {leave.status === "pending" ? (
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleStatusChange(leave._id, "approved")}
                            disabled={actionLoading === leave._id + "approved"}
                            className={`bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-xs font-medium transition ${
                              actionLoading === leave._id + "approved" ? "opacity-60 cursor-not-allowed" : ""
                            }`}
                          >
                            {actionLoading === leave._id + "approved" ? "Approving..." : "Approve"}
                          </button>
                          <button
                            onClick={() => handleStatusChange(leave._id, "rejected")}
                            disabled={actionLoading === leave._id + "rejected"}
                            className={`bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-xs font-medium transition ${
                              actionLoading === leave._id + "rejected" ? "opacity-60 cursor-not-allowed" : ""
                            }`}
                          >
                            {actionLoading === leave._id + "rejected" ? "Rejecting..." : "Reject"}
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

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {leaves.map((leave) => (
              <div
                key={leave._id}
                className="bg-white border border-gray-200 rounded-lg shadow-md p-4 space-y-2"
              >
                <div className="flex items-center gap-2 font-medium">
                  <FaUser className="text-gray-500" /> {leave.fullName}
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <FaEnvelope /> {leave.userEmail}
                </div>
                <div>
                  <span className="font-semibold">Reason:</span> {leave.reasonType}
                </div>
                <div>
                  <span className="font-semibold">Description:</span> {leave.description || "—"}
                </div>
                <div className="flex justify-between text-gray-600 text-sm">
                  <div>
                    <span className="font-semibold">Start:</span> {new Date(leave.startDate).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-semibold">End:</span> {new Date(leave.endDate).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      leave.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : leave.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {leave.status}
                  </span>
                  {leave.status === "pending" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStatusChange(leave._id, "approved")}
                        disabled={actionLoading === leave._id + "approved"}
                        className={`bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-xs font-medium transition ${
                          actionLoading === leave._id + "approved" ? "opacity-60 cursor-not-allowed" : ""
                        }`}
                      >
                        {actionLoading === leave._id + "approved" ? "Approving..." : "Approve"}
                      </button>
                      <button
                        onClick={() => handleStatusChange(leave._id, "rejected")}
                        disabled={actionLoading === leave._id + "rejected"}
                        className={`bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-xs font-medium transition ${
                          actionLoading === leave._id + "rejected" ? "opacity-60 cursor-not-allowed" : ""
                        }`}
                      >
                        {actionLoading === leave._id + "rejected" ? "Rejecting..." : "Reject"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LeaveRequests;

import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useAppContext } from "../../../context/AppContext";
import LoadingSpinner from "../../../components/reusable/LoadingSpinner";
import PageHeader from "../../../components/reusable/PageHeader";
import { FaCheckCircle, FaTimesCircle, FaClock } from "react-icons/fa";

const AdminVerifyAttendance = () => {
  const { token } = useAppContext();
  const [pendingList, setPendingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const API = import.meta.env.VITE_API_URL;

  /** 🔹 Fetch pending attendance records */
  const fetchPending = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API}/api/attendance/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const pending = data.filter((r) => r.status === "pending");
      setPendingList(pending);
    } catch (err) {
      console.error("Failed to fetch pending:", err);
      Swal.fire("Error", "Failed to fetch pending attendance.", "error");
    } finally {
      setLoading(false);
    }
  };

  /** 🔹 Verify or Reject Attendance */
  const handleVerify = async (id, status) => {
    try {
      const confirm = await Swal.fire({
        title: `Are you sure?`,
        text:
          status === "attended"
            ? "This will approve the attendance."
            : "This will mark it as unauthorized leave.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText:
          status === "attended" ? "Yes, Approve" : "Yes, Reject",
      });
      if (!confirm.isConfirmed) return;

      await axios.post(
        `${API}/api/attendance/verify`,
        { attendanceId: id, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire(
        "Success",
        status === "attended"
          ? "Attendance marked as attended."
          : "Attendance rejected.",
        "success"
      );

      fetchPending();
    } catch (err) {
      Swal.fire("Error", err?.response?.data?.message || "Failed to update attendance.", "error");
    }
  };

  useEffect(() => {
    fetchPending();
  }, [token]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <PageHeader
        title="Verify Attendance"
        subtitle="Approve or reject pending attendance requests"
      />

      {pendingList.length === 0 ? (
        <div className="bg-white text-center py-10 rounded-xl shadow-sm border border-gray-100">
          <FaClock className="mx-auto text-4xl text-gray-400 mb-3" />
          <p className="text-gray-500">No pending attendance to verify 🎉</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100 mt-6">
          <table className="min-w-full text-sm text-left text-gray-700">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-6 py-3">Employee</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Method</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingList.map((item) => (
                <tr key={item._id} className="border-b hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-gray-800">{item.userEmail}</td>
                  <td className="px-6 py-4">{item.date}</td>
                  <td className="px-6 py-4 capitalize">{item.method}</td>
                  <td className="px-6 py-4 text-yellow-600 font-medium">{item.status}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleVerify(item._id, "attended")}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md flex items-center gap-1 inline-flex"
                    >
                      <FaCheckCircle /> Approve
                    </button>
                    <button
                      onClick={() => handleVerify(item._id, "unauthorized leave")}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md flex items-center gap-1 inline-flex"
                    >
                      <FaTimesCircle /> Reject
                    </button>
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

export default AdminVerifyAttendance;

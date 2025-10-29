import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useAppContext } from "../../../context/AppContext";
import LoadingSpinner from "../../../components/reusable/LoadingSpinner";
import { usePolish } from "../../../hooks/usePolish";
import PageHeader from "../../../components/reusable/PageHeader";

const EmployeeRequests = () => {
  const { token } = useAppContext();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all pending requests
  const fetchRequests = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/users/all`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const pending = data.filter((u) => u.role === "pending request");
      setRequests(pending);
    } catch (error) {
      console.error("Failed to fetch requests:", error);
    } finally {
      setLoading(false);
    }
  };

  // Approve user (role update)
  const handleRoleChange = async (userId, role) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/users/update-role/${userId}`,
        { role },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire({
        position: "center",
        icon: "success",
        title: `User approved as ${role}`,
        showConfirmButton: false,
        timer: 800,
      });

      setRequests((prev) => prev.filter((u) => u._id !== userId));
    } catch (error) {
      console.error("Role update failed:", error);
      Swal.fire({
        position: "center",
        icon: "error",
        title: "Role update failed",
        showConfirmButton: false,
        timer: 800,
      });
    }
  };

  // Reject (Delete) user request
  const handleReject = async (userId) => {
    const confirm = await Swal.fire({
      title: "Reject this request?",
      text: "The user will be removed permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonText: "Cancel",
      confirmButtonText: "Yes, reject",
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/users/delete/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire({
        icon: "success",
        title: "Request Rejected",
        text: "User has been removed successfully.",
        timer: 800,
        showConfirmButton: false,
      });

      setRequests((prev) => prev.filter((u) => u._id !== userId));
    } catch (error) {
      console.error("Delete failed:", error);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Could not reject the user request.",
        timer: 800,
        showConfirmButton: false,
      });
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [token]);

  // Real-time updates
  usePolish({
    "user-change": ({ type, user, userId }) => {
      setRequests((prev) => {
        if (type === "deleted" || (user && user.role !== "pending request")) {
          return prev.filter((u) => u._id !== (user?._id || userId));
        }
        if (
          (type === "added" || type === "updated") &&
          user?.role === "pending request"
        ) {
          const filtered = prev.filter((u) => u._id !== user._id);
          return [...filtered, user];
        }
        return prev;
      });
    },
  });

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500">
        <LoadingSpinner size="lg" className="mb-3" />
        <p>Loading pending requests...</p>
      </div>
    );

  return (
    <div className="p-6">
      <PageHeader title="Pending Employee Requests" subtitle="Approve or reject new user registrations" />

      {requests.length === 0 ? (
        <p className="text-center py-10 text-gray-500">
          No pending requests found.
        </p>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Profile</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Job Title</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((user, i) => (
                  <tr
                    key={user._id}
                    className="border-b border-gray-100 hover:bg-primary/5 transition"
                  >
                    <td className="px-4 py-3 text-gray-700">{i + 1}</td>
                    <td className="px-4 py-3">
                      <img
                        src={user.image}
                        alt={user.fullName}
                        className="w-10 h-10 rounded-full object-cover border border-primary/30"
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {user.fullName}
                    </td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">{user.jobTitle || "-"}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center items-center gap-3">
                        <select
                          onChange={(e) =>
                            handleRoleChange(user._id, e.target.value)
                          }
                          defaultValue=""
                          className="border border-gray-300 rounded-md px-3 py-2 text-gray-700 bg-white hover:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary"
                        >
                          <option value="" disabled>
                            Approve as
                          </option>
                          <option value="employee">Employee</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button
                          onClick={() => handleReject(user._id)}
                          className="px-3 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4 p-3">
            {requests.map((user, i) => (
              <div
                key={i}
                className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={user.image}
                    alt={user.fullName}
                    className="w-12 h-12 rounded-full object-cover border border-primary/30"
                  />
                  <div>
                    <p className="font-semibold text-gray-800">{user.fullName}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  <strong>Job:</strong> {user.jobTitle || "-"}
                </p>

                <div className="mt-4 flex gap-2">
                  <select
                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                    defaultValue=""
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-gray-700 bg-white hover:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary"
                  >
                    <option value="" disabled>
                      Approve as
                    </option>
                    <option value="employee">Employee</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button
                    onClick={() => handleReject(user._id)}
                    className="flex-1 px-3 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeRequests;

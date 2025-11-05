import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useAppContext } from "../../../context/AppContext";
import LoadingSpinner from "../../../components/reusable/LoadingSpinner";
import { usePolish } from "../../../hooks/usePolish";
import PageHeader from "../../../components/reusable/PageHeader";

const EmployeeRequests = () => {
  const { token, setPendingUsers } = useAppContext();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOffDays, setSelectedOffDays] = useState({});
console.log(setPendingUsers)
  const offDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // Fetch all pending user requests
  const fetchRequests = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/users/pending`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setRequests(data.users);
      console.log(data)
     
    } catch (error) {
      console.error("Failed to fetch requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchRequests();
  }, [token]);

  // setPendingUsers(requests);


  // Live sync (via socket)
  usePolish({
    "user-change": ({ type, user, userId }) => {
      setRequests((prev) => {
        // Remove deleted or no longer pending users
        if (
          type === "deleted" ||
          (user && (user.role !== "pending request" || !user.isProfileComplete))
        ) {
          const updated = prev.filter((u) => u._id !== (user?._id || userId));
        
          return updated;
        }

        // Add or update user only if both conditions true
        if (
          (type === "added" || type === "updated") &&
          user?.role === "pending request" &&
          user?.isProfileComplete
        ) {
          const updated = [...prev.filter((u) => u._id !== user._id), user];

          return updated;
        }

        return prev;
      });
    },
  });

  // Approve user as Employee
  const handleApprove = async (userId) => {
    const offDay = selectedOffDays[userId];
    if (!offDay) {
      Swal.fire({
        icon: "warning",
        title: "Off Day Required",
        text: "Please select an off day before approving.",
        confirmButtonColor: "#f59e0b",
      });
      return;
    }

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/users/update-role/${userId}`,
        { offDay },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire({
        icon: "success",
        title: "Approved as Employee",
        text: `User approved successfully (Off day: ${offDay}).`,
        showConfirmButton: false,
        timer: 1500,
      });

      const updated = requests.filter((u) => u._id !== userId);
      setRequests(updated);
   
    } catch (error) {
      console.error("Approval failed:", error);
      Swal.fire({
        icon: "error",
        title: "Approval Failed",
        text: error?.response?.data?.message || "Something went wrong.",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  // Reject request
  const handleReject = async (userId) => {
    const confirm = await Swal.fire({
      title: "Reject this request?",
      text: "This will permanently remove the user request.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
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
        showConfirmButton: false,
        timer: 1200,
      });

      const updated = requests.filter((u) => u._id !== userId);
      setRequests(updated);
   
    } catch (error) {
      console.error("Delete failed:", error);
      Swal.fire({
        icon: "error",
        title: "Failed to Reject",
        text: "Could not delete the user request.",
        confirmButtonColor: "#ef4444",
      });
    }
  };
console.log('requests : ', requests)
  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500">
        <LoadingSpinner size="lg" className="mb-3" />
        <p>Loading pending requests...</p>
      </div>
    );

  return (
    <div className="p-6">
      <PageHeader
        title="Pending Employee Requests"
        subtitle="Approve or reject new employee registration requests"
      />

      {requests.length === 0 ? (
        <p className="text-center py-10 text-gray-500">
          No pending employee requests.
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
                    <th className="px-4 py-3">Profile</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Job Title</th>
                    <th className="px-4 py-3">Off Day</th>
                    <th className="px-4 py-3 text-center w-40">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests?.map((user, i) => (
                    <tr
                      key={user._id}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="px-4 py-3 text-gray-700">{i + 1}</td>
                      <td className="px-4 py-3">
                        <img
                          src={user.image}
                          alt={user.fullName}
                          className="w-10 h-10 rounded-full object-cover border border-gray-200"
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {user.fullName}
                      </td>
                      <td className="px-4 py-3">{user.email}</td>
                      <td className="px-4 py-3">{user.jobTitle || "-"}</td>

                      {/* Off Day Selector */}
                      <td className="px-4 py-3">
                        <select
                          value={selectedOffDays[user._id] || ""}
                          onChange={(e) =>
                            setSelectedOffDays((prev) => ({
                              ...prev,
                              [user._id]: e.target.value,
                            }))
                          }
                          className="border border-gray-300 rounded-md px-3 py-2 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="">Select</option>
                          {offDays.map((day) => (
                            <option key={day} value={day}>
                              {day}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center items-center gap-2">
                          <button
                            onClick={() => handleApprove(user._id)}
                            className="px-3 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition text-xs font-medium"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(user._id)}
                            className="px-3 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition text-xs font-medium"
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
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-5">
            {requests.map((user, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 p-5"
              >
                {/* Header Section */}
                <div className="flex items-center gap-4 mb-5">
                  <img
                    src={user.image}
                    alt={user.fullName}
                    className="w-14 h-14 rounded-full object-cover border border-gray-200"
                  />
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      {user.fullName}
                    </h3>
                    <p className="text-sm text-gray-600">{user.jobTitle}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </div>
                </div>

                {/* Off Day + Actions Grid */}
                <div className="grid grid-cols-2 gap-4 items-end">
                  {/* Off Day Selector */}
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Off Day : 
                    </label>
                    <select
                      value={selectedOffDays[user._id] || ""}
                      onChange={(e) =>
                        setSelectedOffDays((prev) => ({
                          ...prev,
                          [user._id]: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                    >
                      <option value="">Select</option>
                      {offDays.map((day) => (
                        <option key={day} value={day}>
                          {day}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(user._id)}
                      className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 focus:ring-2 focus:ring-primary/40 transition"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(user._id)}
                      className="flex-1 px-4 py-2.5 rounded-lg bg-secondary text-white text-sm font-medium hover:bg-secondary/90 focus:ring-2 focus:ring-secondary/40 transition"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default EmployeeRequests;

// src/pages/Dashboard/roles/EmployeeRequests.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useAppContext } from "../../../context/AppContext";
import LoadingSpinner from "../../../components/reusable/LoadingSpinner";

const EmployeeRequests = () => {
  const { token } = useAppContext();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch pending employee requests
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

  // 🔹 Update user role (admin or employee)
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
        title: `User promoted to ${role}`,
        showConfirmButton: false,
        timer: 700,
      });

      fetchRequests(); // Refresh list
    } catch (error) {
      console.error("Role update failed:", error);
      Swal.fire({
        position: "center",
        icon: "error",
        title: "Role update failed",
        showConfirmButton: false,
        timer: 700,
      });
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Pending Employee Requests</h1>

      {requests.length === 0 ? (
        <p className="text-gray-500">No pending requests.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="min-w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Job Title</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((user) => (
                <tr key={user._id} className="border-b hover:bg-gray-50">
                  <td className="p-3 flex items-center gap-3">
                    {/* Hide image on small screens */}
                    <img
                      src={user.image}
                      alt={user.fullName}
                      className="hidden sm:block w-10 h-10 rounded-full object-cover"
                    />
                    {user.fullName}
                  </td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3">{user.jobTitle}</td>
                  <td className="p-3 text-center">
                    <select
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      defaultValue=""
                      className="border border-gray-300 rounded-md px-3 py-1 text-gray-700 bg-white hover:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="" disabled>
                        Select role
                      </option>
                      <option value="employee">Employee</option>
                      <option value="admin">Admin</option>
                    </select>
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

export default EmployeeRequests;

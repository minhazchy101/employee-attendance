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

  const approveUser = async (id) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/users/update-role/${id}`,
        { role: "employee" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      
      Swal.fire({
  position: "center",
  icon: "success",
  title: "Employee approved",
  showConfirmButton: false,
  timer: 500
});
fetchRequests();
} catch {
      
      Swal.fire({
      position: "center",
       icon: "error",
  
      title: "Approval failed",
      showConfirmButton: false,
      timer: 500
      });
      // toast.error("Approval failed");
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">
        Pending Employee Requests
      </h1>
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
                <tr key={user._id} className="border-b">
                  <td className="p-3 flex items-center gap-3">
                    <img
                      src={user.image}
                      alt={user.fullName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    {user.fullName}
                  </td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3">{user.jobTitle}</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => approveUser(user._id)}
                      className="px-4 py-1 rounded-lg bg-green-500 text-white hover:bg-green-600"
                    >
                      Approve
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

export default EmployeeRequests;

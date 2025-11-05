import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useAppContext } from "../../../context/AppContext";
import { usePolish } from "../../../hooks/usePolish";
import PageHeader from "../../../components/reusable/PageHeader";
import LoadingSpinner from "../../../components/reusable/LoadingSpinner";
import { useNavigate } from "react-router-dom";

const AllEmployees = () => {
  const { token } = useAppContext();
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/users/all`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(data);
      setFiltered(data);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchUsers();
  }, [token]);

  usePolish({
    "user-change": () => fetchUsers(),
  });

  useEffect(() => {
    if (!search) return setFiltered(users);
    const q = search.toLowerCase();
    setFiltered(
      users.filter(
        (u) =>
          u.fullName?.toLowerCase().includes(q) ||
          u.niNumber?.toLowerCase().includes(q)
      )
    );
  }, [search, users]);

  const handleRoleChange = async (userId, currentRole) => {
    const newRole = currentRole === "admin" ? "employee" : "admin";

    const confirm = await Swal.fire({
      title: "Change Role?",
      text: `Do you want to make this user an ${newRole}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: `Yes, make ${newRole}`,
      cancelButtonText: "Cancel",
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/users/update-role/${userId}`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire("Updated!", `User role changed to ${newRole}.`, "success");
      fetchUsers();
    } catch (err) {
      Swal.fire("Error", "Failed to update role", "error");
      console.error(err);
    }
  };

  const handleDelete = async (userId) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This user will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/users/delete/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire("Deleted!", "User has been removed.", "success");
      fetchUsers();
    } catch (err) {
      Swal.fire("Error", "Failed to delete user", "error");
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <PageHeader title="All Employees" subtitle="Manage and view all users" />

      {/* Search Section */}
      <div className="flex flex-col md:flex-row gap-3 mt-6 mb-4">
        <input
          type="text"
          placeholder="Search by name or NI number"
          className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary w-full md:w-1/3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          onClick={() => setSearch("")}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/80 transition"
        >
          Clear
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] py-12 text-gray-500">
            <LoadingSpinner size="lg" className="mb-3" />
            <span>Loading employees...</span>
          </div>
        ) : filtered.length > 0 ? (
          <>
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
                    <th className="px-4 py-3">NI Number</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u, i) => (
                    <tr key={u._id} className="hover:bg-primary/5 border-b">
                      <td className="px-4 py-3">{i + 1}</td>
                      <td className="px-4 py-3">
                        <img
                          src={u.image}
                          alt={u.fullName}
                          className="w-10 h-10 rounded-full object-cover border border-primary/20 cursor-pointer"
                          onClick={() => navigate(`/dashboard/profileDetails/${u._id}`)}
                        />
                      </td>
                      <td
                        className="px-4 py-3 font-medium cursor-pointer hover:underline"
                        onClick={() => navigate(`/dashboard/profileDetails/${u._id}`)}
                      >
                        {u.fullName}
                      </td>
                      <td className="px-4 py-3">{u.email}</td>
                      <td className="px-4 py-3">{u.jobTitle || "-"}</td>
                      <td className="px-4 py-3">{u.niNumber}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            u.role === "admin"
                              ? "bg-primary text-white"
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 flex flex-wrap gap-2">
                        <button
                          onClick={() => handleRoleChange(u._id, u.role)}
                          className="px-3 py-1 rounded-md bg-secondary text-white hover:bg-secondary/80"
                        >
                          Toggle
                        </button>
                        <button
                          onClick={() => handleDelete(u._id)}
                          className="px-3 py-1 rounded-md bg-red-500 text-white hover:bg-red-600"
                        >
                          Remove
                        </button>
                        <button
                          onClick={() => navigate(`/dashboard/profileDetails/${u._id}`)}
                          className="px-3 py-1 rounded-md bg-blue-500 text-white hover:bg-blue-600"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4 p-2">
              {filtered.map((u, i) => (
                <div
                  key={i}
                  className="border border-gray-200 rounded-lg p-4 shadow-sm"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={u.image}
                      alt={u.fullName}
                      className="w-12 h-12 rounded-full object-cover border border-primary/30 cursor-pointer"
                      onClick={() => navigate(`/dashboard/profileDetails/${u._id}`)}
                    />
                    <div>
                      <p
                        className="font-semibold text-gray-800 cursor-pointer hover:underline"
                        onClick={() => navigate(`/dashboard/profileDetails/${u._id}`)}
                      >
                        {u.fullName}
                      </p>
                      <p className="text-sm text-gray-500">{u.email}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    <strong>Job:</strong> {u.jobTitle || "-"}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>NI:</strong> {u.niNumber}
                  </p>
                  <div className="mt-2">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                        u.role === "admin"
                          ? "bg-primary text-white"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {u.role}
                    </span>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleRoleChange(u._id, u.role)}
                      className="flex-1 px-3 py-2 rounded-md bg-secondary text-white hover:bg-secondary/80"
                    >
                      Toggle
                    </button>
                    <button
                      onClick={() => handleDelete(u._id)}
                      className="flex-1 px-3 py-2 rounded-md bg-red-500 text-white hover:bg-red-600"
                    >
                      Remove
                    </button>
                    <button
                      onClick={() => navigate(`/dashboard/profileDetails/${u._id}`)}
                      className="flex-1 px-3 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-center py-10 text-gray-500">
            No employees found
          </p>
        )}
      </div>
    </div>
  );
};

export default AllEmployees;

// src/components/layout/Sidebar.jsx
import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import { usePolish } from "../../hooks/usePolish"; // Real-time hook
import {
  FaUser,
  FaUsers,
  FaSignOutAlt,
  FaClipboardList,
  FaHome,
  FaClock,
  FaPaperPlane,
} from "react-icons/fa";
import axios from "axios";
import LoadingSpinner from "../reusable/LoadingSpinner";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { profile, logout, token } = useAppContext();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = profile?.role === "admin";

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${
      isActive
        ? "bg-indigo-600 text-white shadow-sm"
        : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
    }`;

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

  // Fetch initial requests
  useEffect(() => {
    fetchRequests();
  }, [token]);

  // 🟢 Real-time updates for pending requests
  usePolish({
    "user-change": ({ type, user }) => {
      setRequests((prev) => {
        const isPending = user.role === "pending request";
        if (type === "added" && isPending) {
          return [...prev, user];
        }
        if (type === "updated") {
          // Remove user if they are no longer pending
          const filtered = prev.filter((u) => u._id !== user._id);
          if (isPending) filtered.push(user); // add if updated to pending
          return filtered;
        }
        return prev;
      });
    },
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-64 bg-white border-r shadow-md">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static z-40 h-full bg-white border-r w-64 flex flex-col justify-between shadow-md transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div>
          {/* Logo / title */}
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-indigo-600">WorkTrack</h2>
            <p className="text-sm text-gray-500 mt-1 capitalize">
              {profile?.role || "user"}
            </p>
          </div>

          {/* Navigation */}
          <nav className="p-4 flex flex-col gap-2">
            <NavLink to="/dashboard" end className={linkClass}>
              <FaHome /> Dashboard
            </NavLink>

            <NavLink to="/dashboard/profile" className={linkClass}>
              <FaUser /> Profile
            </NavLink>

            {isAdmin ? (
              <>
                <NavLink to="/dashboard/all-employees" className={linkClass}>
                  <FaUsers /> All Employees
                </NavLink>

                <NavLink to="/dashboard/employee-requests" className={linkClass}>
                  <FaClipboardList /> Employee Requests
                  {requests.length > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {requests.length}
                    </span>
                  )}
                </NavLink>

                <NavLink to="/dashboard/leave-requests" className={linkClass}>
                  <FaPaperPlane /> Leave Requests
                </NavLink>
              </>
            ) : (
              <>
                <NavLink to="/dashboard/my-attendance" className={linkClass}>
                  <FaClock /> My Attendance
                </NavLink>

                <NavLink to="/dashboard/leave-request" className={linkClass}>
                  <FaPaperPlane /> Leave Request
                </NavLink>
              </>
            )}
          </nav>
        </div>

        {/* Logout */}
        <div className="p-4 border-t">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-2 w-full rounded-lg text-red-600 hover:bg-red-50 transition"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

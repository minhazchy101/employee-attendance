import React from "react";
import { NavLink } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import {
  FaUser,
  FaUsers,
  FaChartLine,
  FaSignOutAlt,
  FaClipboardList,
  FaHome,
  FaClock,
  FaPaperPlane,
} from "react-icons/fa";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { profile, logout } = useAppContext();
  const isAdmin = profile?.role === "admin";
const linkClass = ({ isActive }) =>
  `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${
    isActive
      ? "bg-indigo-600 text-white shadow-sm"
      : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
  }`;
;

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

            {isAdmin ? (
              <>
                <NavLink to="/dashboard/profile" className={linkClass}>
                  <FaUser /> Profile
                </NavLink>
                <NavLink to="/dashboard/all-employees" className={linkClass}>
                  <FaUsers /> All Employees
                </NavLink>
                {/* <NavLink to="/dashboard/employee-requests" className={linkClass}>
                   Employee Requests
                </NavLink> */}
                 <NavLink to="/dashboard/employee-requests" className={linkClass}>
  <FaClipboardList />   Employee Requests 
    {profile?.pendingCount > 0 && (
      <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
        {profile.pendingCount}
      </span>
    )}
  </NavLink>
                <NavLink to="/dashboard/leave-requests" className={linkClass}>
                  <FaPaperPlane /> Leave Requests
                </NavLink>
              </>
            ) : (
              <>
                <NavLink to="/dashboard/profile" className={linkClass}>
                  <FaUser /> Profile
                </NavLink>
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

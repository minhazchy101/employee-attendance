import React, { useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";

import {
  FaUser,
  FaUsers,
  FaSignOutAlt,
  FaClipboardList,
  FaHome,
  FaClock,
  FaPassport,
} from "react-icons/fa";

import LoadingSpinner from "../reusable/LoadingSpinner";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { profile, logout, pendingRequests, loading } = useAppContext();
  const navigate = useNavigate();
 


  const isAdmin = profile?.role === "admin";
  const hasCompleteProfile = profile?.isProfileComplete; // flag for complete profile

  // Protect Dashboard access
  useEffect(() => {
    if (!loading && !hasCompleteProfile) {
      navigate("/dashboard/complete-profile");
    }
  }, [loading, hasCompleteProfile]);

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${
      isActive
        ? "bg-primary text-white shadow-md"
        : "text-gray-700 hover:bg-primary/10 hover:text-primary"
    }`;
console.log('pendingRequests : ', pendingRequests.length)
  
  
if (loading) {
  return (
    <div className="flex items-center justify-center h-full w-64 bg-white border-r shadow-md">
      <LoadingSpinner size="lg" />
    </div>
  );
}
  
console.log(profile)
  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed md:static z-40 h-full bg-white border-r w-64 flex flex-col justify-between shadow-lg transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div>
          {/* Logo */}
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold text-primary">WorkTrack</h2>
            <p className="text-sm text-gray-500 mt-1 capitalize">{profile?.role || "user"}</p>
          </div>

          {/* Navigation */}
          <nav className="p-4 flex flex-col gap-2">
            {/* Always show complete profile */}
            {!hasCompleteProfile &&  
            
            <NavLink to="/dashboard/complete-profile" end className={linkClass}>
              <FaPassport /> Complete Profile
            </NavLink>
            }

            {/* Only accessible if profile is complete */}
            {hasCompleteProfile && (
              <>
                <NavLink to="/dashboard" end className={linkClass}>
                  <FaHome /> Dashboard
                </NavLink>

                <NavLink to="/dashboard/attendance-history" className={linkClass}>
                  <FaClock /> Attendance History
                </NavLink>

                <NavLink to="/dashboard/profile" className={linkClass}>
                  <FaUser /> Profile
                </NavLink>

                {isAdmin && (
                  <>
                    <NavLink to="/dashboard/all" className={linkClass}>
                      <FaUsers /> All Users
                    </NavLink>

                    <NavLink to="/dashboard/employee-requests" className={linkClass}>
                      <FaClipboardList /> Employee Requests
                      { pendingRequests.length > 0 && (
                        <span className="ml-auto bg-secondary text-white rounded-full px-2 py-0.5 text-xs font-semibold">
                          { pendingRequests.length}
                        </span>
                      )}
                    </NavLink>
                  </>
                )}
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

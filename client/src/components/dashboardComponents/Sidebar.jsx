import React, { useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
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
  const { profile, logout,  loading, location, navigate } = useAppContext();

  const isAdmin = profile?.role === "admin";
  const isPending = profile?.role === "pending request";
  const hasCompleteProfile = profile?.isProfileComplete;


  // ✅ Redirect logic for pending users
  useEffect(() => {
    if (!loading && isPending) {
      const path = location.pathname;

      if (!hasCompleteProfile && path !== "/dashboard/complete-profile") {
        // Force pending (incomplete) users to complete their profile first
        navigate("/dashboard/complete-profile", { replace: true });
      } else if (hasCompleteProfile && path !== "/dashboard/profile") {
        // After completing profile, show only the profile page
        navigate("/dashboard/profile", { replace: true });
      }
    }
  }, [loading, isPending, hasCompleteProfile, location.pathname, navigate]);

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300 text-light ${
      isActive
        ? "bg-primary text-white shadow-md"
        : "text-gray-700 hover:bg-primary/40 hover:text-light"
    }`;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-64 bg-white border-r shadow-md">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden "
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed md:static z-40 h-full bg-black  border-r w-64 flex flex-col justify-between shadow-lg transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div>
          {/* Logo */}
          <div className="p-6 border-b">
            
                   <Link to="/" className="flex items-center gap-2">
                   <h1 className="text-2xl text-primary/80">
                        Attendance<span className="text-light font-semibold">Pro</span>
                   </h1>
                
                   </Link>
          </div>

          {/* Navigation */}
          <nav className="p-4 flex flex-col gap-2 ">
            {/* 🟡 Pending User */}
            {isPending && (
              <>
                {!hasCompleteProfile ? (
                  <NavLink to="/dashboard/complete-profile" className={linkClass}>
                    <FaPassport /> Complete Profile
                  </NavLink>
                ) : (
                  <NavLink to="/dashboard/profile" className={linkClass}>
                    <FaUser /> Profile
                  </NavLink>
                )}
              </>
            )}

            {/* 🟢 Employee */}
            {profile.role === "employee" && hasCompleteProfile && (
              <>
                <NavLink to="/dashboard/employee-dashboard" className={linkClass}>
                  <FaHome /> Dashboard
                </NavLink>
                <NavLink to="/dashboard/attendance-history" className={linkClass}>
                  <FaClock /> Attendance History
                </NavLink>
               <NavLink to="/dashboard/leave-apply" className={linkClass}>
  <FaClipboardList /> Leave Apply
</NavLink>
                <NavLink to="/dashboard/profile" className={linkClass}>
                  <FaUser /> Profile
                </NavLink>
              </>
            )}

            {/* 🔵 Admin */}
            {isAdmin && hasCompleteProfile && (
              <>
                <NavLink to="/dashboard/admin-dashboard" className={linkClass}>
                  <FaHome /> Dashboard
                </NavLink>

                <NavLink to="/dashboard/admin-verify-attendance" className={linkClass}>
                  <FaUsers /> Verify Attendance
                </NavLink>
                <NavLink to="/dashboard/admin-attendance-history" className={linkClass}>
                  <FaUsers />Attendance History
                </NavLink>

                <NavLink to="/dashboard/all-employees" className={linkClass}>
                  <FaUsers /> All Employees
                </NavLink>

                <NavLink to="/dashboard/employee-requests" className={linkClass}>
                  <FaClipboardList /> Employee Requests
                  {/* {pendingUsers.length > 0 && (
                    <span className="ml-auto bg-secondary text-white rounded-full px-2 py-0.5 text-xs font-semibold">
                      {pendingUsers.length}
                    </span>
                  )} */}
                </NavLink>

                <NavLink to="/dashboard/leave-requests" className={linkClass}>
  <FaClipboardList /> Leave Requests
 
</NavLink>

                <NavLink to="/dashboard/profile" className={linkClass}>
                  <FaUser /> Profile
                </NavLink>
              </>
            )}
          </nav>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-light">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-2 w-full rounded-lg text-red-600 hover:bg-red-600/60 hover:text-light transition-all duration-300 cursor-pointer "
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

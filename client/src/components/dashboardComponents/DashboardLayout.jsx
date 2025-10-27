import React, { useState, useEffect } from "react";

import Sidebar from "./Sidebar";
import { useAppContext } from "../../context/AppContext";
import { FaBars } from "react-icons/fa";
import { Outlet } from "react-router-dom";

const DashboardLayout = () => {
  const { profile, loading,navigate } = useAppContext();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);

 useEffect(() => {
  if (!loading && !profile) {
    navigate("/");
  }
}, [loading, profile, navigate]);

  // Redirect /dashboard → specific dashboard page based on role
 useEffect(() => {
  // only redirect if the user is exactly on /dashboard
  if (!loading && profile && window.location.pathname === "/dashboard") {
    if (profile.role === "admin") navigate("/dashboard/admin");
    else if (profile.role === "employee") navigate("/dashboard/employee");
  }
}, [loading, profile, navigate]);


  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between bg-white shadow-sm p-4 border-b">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden text-gray-600"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <FaBars size={22} />
            </button>
            <h1 className="text-lg font-semibold text-gray-800">
              {profile?.role === "admin"
                ? "Admin Dashboard"
                : "Employee Dashboard"}
            </h1>
          </div>
        </header>

        {/* Dashboard content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

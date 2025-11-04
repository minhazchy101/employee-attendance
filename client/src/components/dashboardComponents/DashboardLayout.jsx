import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { useAppContext } from "../../context/AppContext";
import { FaBars } from "react-icons/fa";
import { Outlet } from "react-router-dom";

const DashboardLayout = () => {
  const { profile, loading, navigate, location } = useAppContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);
console.log(profile)
  useEffect(() => {
    if (!loading && profile) {
      const currentPath = location.pathname;
console.log(currentPath)
      // // Redirect pending users only
      // if (profile.role === "pending request" && currentPath !== "/dashboard/complete-profile") {
      //   navigate("/dashboard/complete-profile", { replace: true });
      // }
    }
  }, [loading, profile, location.pathname, navigate]);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between bg-white shadow-sm p-4 border-b">
          <div className="flex items-center gap-4">
            {/* Mobile Toggle */}
            <button
              className="md:hidden text-gray-600 hover:text-primary transition"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <FaBars size={22} />
            </button>
            <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-gray-600 font-medium capitalize">
              {profile?.role || "User"}
            </span>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

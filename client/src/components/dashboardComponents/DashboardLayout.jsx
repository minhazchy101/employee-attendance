import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { useAppContext } from "../../context/AppContext";
import { FaBars } from "react-icons/fa";
import { Outlet, useLocation } from "react-router-dom";

const DashboardLayout = () => {
  const { profile, loading, navigate } = useAppContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (!loading && !profile) {
      navigate("/");
    }
  }, [loading, profile, navigate]);

  useEffect(() => {
    if (!loading && profile && location.pathname === "/dashboard") {
      navigate("/dashboard");
    }
  }, [loading, profile, navigate, location.pathname]);

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
              className="md:hidden text-gray-600 hover:text-primary transition"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <FaBars size={22} />
            </button>
            <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
          </div>
          <div className="text-sm text-gray-600 capitalize">{profile?.role}</div>
        </header>

        {/* Dashboard content */}
        <main className="flex-1 p-6 overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

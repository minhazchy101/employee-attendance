import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAppContext } from "../../context/AppContext";
import { FaBars } from "react-icons/fa";

const DashboardLayout = () => {
  const { profile } = useAppContext();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!profile) navigate("/");
  }, [profile, navigate]);

  // Redirect /dashboard → specific dashboard page based on role
  useEffect(() => {
    if (profile?.role === "admin") {
      navigate("/dashboard/admin");
    } else if (profile?.role === "employee") {
      navigate("/dashboard/employee");
    }
  }, [profile, navigate]);

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

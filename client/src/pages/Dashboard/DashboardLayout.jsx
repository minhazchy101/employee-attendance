import React from "react";
import { useAppContext } from "../../context/AppContext";
import AdminDashboard from "./roles/AdminDashboard";
import EmployeeDashboard from "./roles/EmployeeDashboard";


const DashboardLayout = () => {
  const { profile, loading } = useAppContext();

  if (loading) return <div className="text-center mt-20">Loading dashboard...</div>;

  if (!profile) {
    return (
      <div className="text-center mt-20 text-red-600">
        No profile found. Please complete registration.
      </div>
    );
  }

  switch (profile.role) {
    case "admin":
      return <AdminDashboard />;
    case "employee":
      return <EmployeeDashboard />;
    // case "manager":
    //   return <ManagerDashboard />;
    default:
      return (
        <div className="text-center mt-20 text-gray-600">
          Unauthorized role: {profile.role}
        </div>
      );
  }
};

export default DashboardLayout;

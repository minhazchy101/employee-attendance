import { Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home/Home";
import DashboardLayout from "./components/dashboardComponents/DashboardLayout";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AuthModal from "./components/AuthModal";
import { useAppContext } from "./context/AppContext";
import ProtectedRoute from "./routes/PrivateRoute";

// Dashboard Pages
import DashboardHome from "./pages/Dashboard/DashboardHome";

import CompleteProfile from "./pages/Dashboard/CompleteProfile";
import AttendanceHistory from "./pages/Dashboard/AttendanceHistory";
import Profile from "./pages/Dashboard/roles/Profile";

// Admin Pages
import AllEmployees from "./pages/Dashboard/admin/AllEmployees";
import EmployeeRequests from "./pages/Dashboard/admin/EmployeeRequests";
// import AdminDashboard from "./pages/Dashboard/admin/AdminDashboard";


// Employee Pages
// import EmployeeDashboard from "./pages/Dashboard/employee/EmployeeDashboard";

const App = () => {
  const { showLogin } = useAppContext();
  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard");

  return (
    <>
      {!isDashboard && <Navbar />}
      {showLogin && <AuthModal />}

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />

        {/* Protected Dashboard Layout */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            {/* Default Dashboard Home */}
            <Route index element={<DashboardHome />} />

            {/* Employee/All Roles */}
            <Route path="complete-profile" element={<CompleteProfile />} />
            <Route path="attendance-history" element={<AttendanceHistory />} />
            <Route path="profile" element={<Profile />} />

            {/* Admin Routes */}
            <Route path="all" element={<AllEmployees />} />
            <Route path="employee-requests" element={<EmployeeRequests />} />

            {/* Optional: Separate Admin Dashboard */}
            {/* <Route path="admin-dashboard" element={<AdminDashboard />} /> */}

            {/* Optional: Employee Dashboard */}
            {/* <Route path="employee-dashboard" element={<EmployeeDashboard />} /> */}
          </Route>
        </Route>

        {/* 404 Fallback */}
        <Route path="*" element={<div className="min-h-screen">Page Not Found</div>} />
      </Routes>

      {!isDashboard && <Footer />}
    </>
  );
};

export default App;

import { Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home/Home";
import DashboardLayout from "./components/dashboardComponents/DashboardLayout";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AuthModal from "./components/AuthModal";
import { useAppContext } from "./context/AppContext";
import ProtectedRoute from "./routes/PrivateRoute";

// Dashboard Pages
import CompleteProfile from "./pages/Dashboard/CompleteProfile";
import AttendanceHistory from "./pages/Dashboard/AttendanceHistory";
import Profile from "./pages/Dashboard/roles/Profile";

// Admin Pages
import AllEmployees from "./pages/Dashboard/admin/AllEmployees";
import EmployeeRequests from "./pages/Dashboard/admin/EmployeeRequests";
import AdminDashboard from "./pages/Dashboard/admin/AdminDashboard";

// Employee Pages
import EmployeeDashboard from "./pages/Dashboard/employe/EmployeeDashboard";
import LeaveRequests from "./pages/Dashboard/admin/LeaveRequests";
import LeaveApply from "./pages/Dashboard/employe/LeaveApply";

const App = () => {
  const { showLogin } = useAppContext();
  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard");

  return (
    <>
      {!isDashboard && <Navbar />}
      {showLogin && <AuthModal />}

      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            
            {/* Role Dashboards */}
            <Route path="employee-dashboard" element={<EmployeeDashboard />} />
            <Route path="admin-dashboard" element={<AdminDashboard />} />
            
            {/* Common Pages */}
            <Route path="complete-profile" element={<CompleteProfile />} />
            <Route path="profile" element={<Profile />} />

            {/* Employee Pages */}
            <Route path="attendance-history" element={<AttendanceHistory />} />
            <Route path="leave-apply" element={<LeaveApply />} />

            {/* Admin Pages */}
            <Route path="all" element={<AllEmployees />} />
            <Route path="employee-requests" element={<EmployeeRequests />} />
            <Route path="leave-requests" element={<LeaveRequests />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<div className="min-h-screen">Page Not Found</div>} />
      </Routes>

      {!isDashboard && <Footer />}
    </>
  );
};

export default App;

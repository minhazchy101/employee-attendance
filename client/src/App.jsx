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
import EmployeeDashboard from "./pages/Dashboard/employee/EmployeeDashboard";
import LeaveRequests from "./pages/Dashboard/admin/LeaveRequests";
import LeaveApply from "./pages/Dashboard/employee/LeaveApply";
import RoleRoute from "./pages/Dashboard/RoleRoute";
import AdminVerifyAttendance from "./pages/Dashboard/admin/AdminVerifyAttendance";
import EmployeeAttendanceCalendar from "./pages/Dashboard/employee/EmployeeAttendanceCalendar";
import AdminAttendanceDashboard from "./pages/Dashboard/admin/AdminAttendanceDashboard";
import ProfileDetails from "./pages/Dashboard/admin/ProfileDetails";

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
      
      <Route path="complete-profile" element={<CompleteProfile />} />
      {/* Common Pages */}
      <Route path="profile" element={<Profile />} />

      {/* Employee-only */}
      <Route element={<RoleRoute allowedRoles={["employee"]} />}>
        <Route path="employee-dashboard" element={<EmployeeDashboard />} />
        <Route path="attendance-history" element={<EmployeeAttendanceCalendar />} />
        <Route path="leave-apply" element={<LeaveApply />} />
      </Route>

      {/* Admin-only */}
      <Route element={<RoleRoute allowedRoles={["admin"]} />}>
        <Route path="admin-dashboard" element={<AdminDashboard />} />
        <Route path="admin-verify-attendance" element={<AdminVerifyAttendance />} />
        <Route path="admin-attendance-history" element={<AdminAttendanceDashboard />} />
        <Route path="all-employees" element={<AllEmployees />} />
         <Route path="profileDetails/:id" element={<ProfileDetails />} />
        <Route path="employee-requests" element={<EmployeeRequests />} />
        <Route path="leave-requests" element={<LeaveRequests />} />
      </Route>
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

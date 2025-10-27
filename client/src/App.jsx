import { Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home/Home";
import DashboardLayout from "./components/dashboardComponents/DashboardLayout";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AuthModal from "./components/AuthModal";
import { useAppContext } from "./context/AppContext";
import ProtectedRoute from "./routes/PrivateRoute";

import EmployeeRequests from "./pages/Dashboard/adimn/EmployeeRequests";
import AdminDashboard from "./pages/Dashboard/adimn/AdminDashboard";
import EmployeeDashboard from "./pages/Dashboard/employe/EmployeeDashboard";
import Profile from "./pages/Dashboard/roles/Profile";

const App = () => {
  const { showLogin } = useAppContext();
  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard");

  return (
    <>
      {!isDashboard && <Navbar />}
      {showLogin && <AuthModal />}

      <Routes>
        <Route path="/" element={<Home />} />

        {/* Protected Dashboard Layout */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
          
            <Route path="admin" element={<AdminDashboard />} />
             <Route path="employee-requests" element={<EmployeeRequests />} />

    <Route path="profile" element={<Profile />}></Route>
            <Route path="employee" element={<EmployeeDashboard />} />
          </Route>
        </Route>
      </Routes>

      {!isDashboard && <Footer />}
    </>
  );
};

export default App;

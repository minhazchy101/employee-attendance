import { Navigate, Outlet } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";


/**
 * RoleRoute protects routes based on user role
 * @param {string[]} allowedRoles - e.g. ["admin"] or ["employee"]
 */
const RoleRoute = ({ allowedRoles }) => {
  const { profile, loading } = useAppContext();

  if (loading) return null; // or a spinner

  if (!profile || !allowedRoles.includes(profile.role)) {
    // Redirect to the user's own dashboard
    if (profile?.role === "admin") return <Navigate to="/dashboard/admin-dashboard" />;
    if (profile?.role === "employee") return <Navigate to="/dashboard/employee-dashboard" />;
    return <Navigate to="/" />; // fallback
  }

  return <Outlet />;
};

export default RoleRoute;

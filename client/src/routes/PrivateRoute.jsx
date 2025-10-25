import { Navigate, Outlet } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const ProtectedRoute = () => {
  const { user, token, loading } = useAppContext();

  // Wait until auth is checked
  if (loading) return <div className="text-center mt-20">Loading...</div>;

  // If not logged in, redirect to home
  if (!user || !token) {
    return <Navigate to="/" replace />;
  }

  // ✅ If logged in, render the child route
  return <Outlet />;
};

export default ProtectedRoute;

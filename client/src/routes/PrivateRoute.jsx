// routes/PrivateRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const PrivateRoute = () => {
  const { user, profile, loading } = useAppContext();

  if (loading) return <div className="text-center mt-20">Loading...</div>;

  if (!user || !profile) return <Navigate to="/" replace />;

  return <Outlet />;
};

export default PrivateRoute;

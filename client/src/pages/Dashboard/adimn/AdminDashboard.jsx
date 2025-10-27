import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAppContext } from "../../../context/AppContext";
import LoadingSpinner from "../../../components/reusable/LoadingSpinner";
import { usePolish } from "../../../hooks/usePolish";

const AdminDashboard = () => {
  const { token } = useAppContext();
  const [stats, setStats] = useState({ employees: 0, pending: 0, admins: 0 });
  const [loading, setLoading] = useState(true);

  // Fetch initial stats
  const fetchStats = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/users/all`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const employees = data.filter(u => u.role === "employee").length;
      const pending = data.filter(u => u.role === "pending request").length;
      const admins = data.filter(u => u.role === "admin").length;

      setStats({ employees, pending, admins });
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, [token]);

  // Real-time updates
  usePolish({
    "user-change": ({ type, user }) => {
      setStats(prev => {
        let { employees, pending, admins } = prev;

        // Handle type
        if (type === "added") {
          if (user.role === "employee") employees++;
          else if (user.role === "admin") admins++;
          else if (user.role === "pending request") pending++;
        }

        if (type === "updated") {
          // If user role changed, adjust counts
          // We'll assume role only changes and we don't track previous role in backend
          // Simplest: recompute from scratch
          fetchStats(); // safest option
          return prev; // placeholder, will update after fetch
        }

        return { employees, pending, admins };
      });
    },
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6 grid gap-6 md:grid-cols-3">
      {[
        { label: "Total Employees", value: stats.employees },
        { label: "Pending Requests", value: stats.pending },
        { label: "Total Admins", value: stats.admins },
      ].map((item, i) => (
        <div
          key={i}
          className="bg-white p-6 rounded-xl shadow hover:shadow-md text-center transition"
        >
          <h2 className="text-3xl font-bold text-indigo-600">{item.value}</h2>
          <p className="text-gray-500 mt-1">{item.label}</p>
        </div>
      ))}
    </div>
  );
};

export default AdminDashboard;

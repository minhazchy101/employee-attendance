import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAppContext } from "../../../context/AppContext";
import LoadingSpinner from "../../../components/reusable/LoadingSpinner";
import { usePolish } from "../../../hooks/usePolish";
import PageHeader from "../../../components/reusable/PageHeader";

const AdminDashboard = () => {
  const { token } = useAppContext();
  const [stats, setStats] = useState({ employees: 0, pending: 0, admins: 0 });
  const [loading, setLoading] = useState(true);

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

 usePolish({
  "user-change": ({ type, user }) => {
    if (type === "added" || type === "updated") fetchStats();
  },
  "attendance-change": (payload) => {
    // payload example: { type: "mark", userEmail: "x@y.com", status: "Attend" }
    console.log("attendance-change event:", payload);
    fetchStats();        // update summary counters (present/absent)
    // if you have an open "all attendance" table state, refetch it here as well
    // fetchAllAttendance?.();
  },
});

  if (loading) return <LoadingSpinner />;

  const cards = [
    { label: "Total Employees", value: stats.employees, color: "bg-indigo-100 text-indigo-700" },
    { label: "Attend Employees", value: stats.employees, color: "bg-indigo-100 text-indigo-700" },
    { label: "Pending Requests", value: stats.pending, color: "bg-yellow-100 text-yellow-700" },
    { label: "Pending Requests", value: stats.admins, color: "bg-green-100 text-green-700" },
  ];

  return (
    <div className="p-6">
      <PageHeader
        title="Admin Dashboard"
        subtitle="Overview of employee and request statistics."
      />

      

      <div className="grid gap-6 md:grid-cols-3">
        {cards.map((item, i) => (
          <div
            key={i}
            className={`p-6 rounded-xl shadow-sm hover:shadow-md bg-white border border-gray-100 transition transform hover:-translate-y-1`}
          >
            <div className={`${item.color} w-14 h-14 rounded-full flex items-center justify-center mx-auto text-xl font-bold`}>
              {item.value}
            </div>
            <p className="text-center text-gray-600 mt-3 font-medium">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;

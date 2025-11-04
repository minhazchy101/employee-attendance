import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAppContext } from "../../../context/AppContext";
import LoadingSpinner from "../../../components/reusable/LoadingSpinner";
import { usePolish } from "../../../hooks/usePolish";
import PageHeader from "../../../components/reusable/PageHeader";
import StatsCard from "../../../components/reusable/StatsCard";
import AdminHolidays from "./AdminHolidays";

// Icons
import {
  FaUsers,
  FaUserShield,
  FaUserClock,
  FaClipboardList,
  FaCalendarCheck,
  FaEnvelopeOpenText,
} from "react-icons/fa";


const AdminDashboard = () => {
  const { token, setPendingUsers } = useAppContext();
  const [stats, setStats] = useState({
    employees: 0,
    admins: 0,
    pendingUsers: 0,
    presentToday: 0,
    pendingLeaves: 0,
    holidays: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const API = import.meta.env.VITE_API_URL;

  /** 🔹 Fetch all user stats */
  const fetchUserStats = async () => {
    const { data } = await axios.get(`${API}/api/users/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const employees = data.filter((u) => u.role === "employee").length;
    const admins = data.filter((u) => u.role === "admin").length;
    const pendingUsers = data.filter((u) => u.role === "pending request" && u.isProfileComplete);
   
    setPendingUsers(pendingUsers)
    return { employees, admins, pendingUsers };
  };

  /** 🔹 Fetch today's attendance stats */
  const fetchAttendanceStats = async () => {
    const { data } = await axios.get(`${API}/api/attendance/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const today = new Date().toISOString().slice(0, 10);
    const todaysRecords = data.filter((r) => r.date === today);
    const presentToday = todaysRecords.filter((r) => r.status === "attended").length;

    return { presentToday };
  };

  /** 🔹 Fetch leave + holiday stats */
  const fetchLeaveHolidayStats = async () => {
    const [leaveRes, holidayRes] = await Promise.all([
      axios.get(`${API}/api/leave/all`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get(`${API}/api/holidays`, {  // Adjusted endpoint
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    const pendingLeaves = leaveRes.data.leaves.filter((l) => l.status === "pending").length;
    const holidays = holidayRes.data.holidays?.length || 0;

    return { pendingLeaves, holidays };
  };

  /** 🔹 Combine all dashboard data */
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [user, attendance, leaveHoliday] = await Promise.all([
        fetchUserStats(),
        fetchAttendanceStats(),
        fetchLeaveHolidayStats(),
      ]);
      setStats({ ...user, ...attendance, ...leaveHoliday });
    } catch (err) {
      console.error("Dashboard fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  /** 🧠 Initial + realtime updates */
  useEffect(() => {
    fetchDashboardData();
  }, [token]);

 usePolish({
  "user-change": () => fetchDashboardData(),
  "attendance-change": () => fetchDashboardData(),
  "leave-status-change": () => fetchDashboardData(),
   "holiday-change": () => fetchDashboardData(),
});

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <PageHeader
        title="Admin Dashboard"
        subtitle="Overview of employees, attendance, leaves, and holidays"
      />

      {/* ---------------- Tabs ---------------- */}
      <div className="mt-6 flex border-b border-gray-200">
        <button
          className={`py-2 px-4 font-semibold ${
            activeTab === "overview"
              ? "border-b-2 border-indigo-600 text-indigo-600"
              : "text-gray-600 hover:text-indigo-500"
          }`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`ml-6 py-2 px-4 font-semibold ${
            activeTab === "holidays"
              ? "border-b-2 border-green-600 text-green-600"
              : "text-gray-600 hover:text-green-500"
          }`}
          onClick={() => setActiveTab("holidays")}
        >
          Holidays
        </button>
      </div>

      {/* ---------------- Tab Content ---------------- */}
      <div className="mt-6">
        {activeTab === "overview" && (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <StatsCard
              label="Total Employees"
              value={stats.employees}
              icon={FaUsers}
              color="indigo"
            />
            <StatsCard
              label="Admins"
              value={stats.admins}
              icon={FaUserShield}
              color="green"
            />
            <StatsCard
              label="Pending User Requests"
              value={stats.pendingUsers.length}
              icon={FaEnvelopeOpenText}
              color="yellow"
            />
            <StatsCard
              label="Employees Present Today"
              value={stats.presentToday}
              icon={FaUserClock}
              color="blue"
            />
            <StatsCard
              label="Pending Leave Requests"
              value={stats.pendingLeaves}
              icon={FaClipboardList}
              color="red"
            />
            <StatsCard
              label="Global Holidays"
              value={stats.holidays}
              icon={FaCalendarCheck}
              color="green"
            />
          </div>
        )}

        {activeTab === "holidays" && (
          <div className="mt-6">
            <AdminHolidays />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

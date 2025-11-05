import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAppContext } from "../../../context/AppContext";
import LoadingSpinner from "../../../components/reusable/LoadingSpinner";
import { usePolish } from "../../../hooks/usePolish";
import PageHeader from "../../../components/reusable/PageHeader";
import StatsCard from "../../../components/reusable/StatsCard";
import AdminHolidays from "./AdminHolidays";
import { useNavigate } from "react-router-dom";

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
  const {
    token,
    pendingEmployees,
    pendingLeave,
    pendingAttendance,
    setPendingEmployees,
    setPendingLeave,
    setPendingAttendance,
  } = useAppContext();

  const [stats, setStats] = useState({
    employees: 0,
    admins: 0,
    presentToday: 0,
    holidays: 0,
  });

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL;

  /** 🔹 Fetch base user, attendance, and holiday stats (non-pending) */
  const fetchBaseDashboard = async () => {
    try {
      setLoading(true);
      const [usersRes, attendanceRes, holidayRes] = await Promise.all([
        axios.get(`${API}/api/users/all`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API}/api/attendance/all`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API}/api/holidays`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const users = usersRes.data;
      const employees = users.filter((u) => u.role === "employee").length;
      const admins = users.filter((u) => u.role === "admin").length;

      const today = new Date().toISOString().slice(0, 10);
      const todaysRecords = attendanceRes.data.filter(
        (r) => r.date === today && r.status === "attended"
      );

      const holidays = holidayRes.data.holidays?.length || 0;

      setStats({
        employees,
        admins,
        presentToday: todaysRecords.length,
        holidays,
      });
    } catch (error) {
      console.error("Dashboard base fetch failed:", error);
    } finally {
      setLoading(false);
    }
  };

  /** 🔹 Fetch and update pending data (shared states) */
  const fetchPendingData = async () => {
    try {
      const [pendingEmp, pendingLeaves, pendingAttend] = await Promise.all([
        axios.get(`${API}/api/users/pending`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API}/api/leave/all`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API}/api/attendance/all`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      // Pending employees (only complete profiles waiting)
      setPendingEmployees(pendingEmp.data.users || []);

      // Pending leaves
      const pendingLeavesFiltered = pendingLeaves.data.leaves.filter(
        (l) => l.status === "pending"
      );
      setPendingLeave(pendingLeavesFiltered);

      // Pending attendance (if applicable)
      const pendingAttendanceFiltered = pendingAttend.data.filter(
        (a) => a.status === "pending"
      );
      setPendingAttendance(pendingAttendanceFiltered);
    } catch (error) {
      console.error("Pending fetch error:", error);
    }
  };

  /** 🧠 Initial load */
  useEffect(() => {
    if (token) {
      fetchBaseDashboard();
      fetchPendingData();
    }
  }, [token]);

  /** 🔄 Real-time auto sync */
  usePolish({
    "user-change": () => fetchPendingData(),
    // "leave-request": fetchDashboardData, 
    "leave-request": () => fetchPendingData(),
    "attendance-change": () => fetchPendingData(),
    "holiday-change": () => fetchBaseDashboard(),
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
              label="Pending Employee Requests"
              value={pendingEmployees.length}
              icon={FaEnvelopeOpenText}
              color="yellow"
              onClick={() => navigate("/dashboard/employee-requests")}
            />
            <StatsCard
              label="Employees Present Today"
              value={stats.presentToday}
              icon={FaUserClock}
              color="blue"
            />
            <StatsCard
              label="Pending Leave Requests"
              value={pendingLeave.length}
              icon={FaClipboardList}
              color="red"
              onClick={() => navigate("/dashboard/leave-requests")}
            />
            <StatsCard
              label="Pending Attendance"
              value={pendingAttendance.length}
              icon={FaUserClock}
              color="orange"
              onClick={() => navigate("/dashboard/attendance-approvals")}
            />
            <StatsCard
              label="Global Holidays"
              value={stats.holidays}
              icon={FaCalendarCheck}
              color="green"
              onClick={() => setActiveTab("holidays")}
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

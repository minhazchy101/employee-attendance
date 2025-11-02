import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import PageHeader from "../../components/reusable/PageHeader";
import StatsCard from "../../components/reusable/StatsCard";
import LoadingSpinner from "../../components/reusable/LoadingSpinner";
import { useAppContext } from "../../context/AppContext";
import { usePolish } from "../../hooks/usePolish";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// === Icons ===
import { FaUserCheck, FaChartPie, FaCalendarCheck } from "react-icons/fa";

ChartJS.register(ArcElement, Tooltip, Legend);

const DashboardHome = () => {
  const { token } = useAppContext();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const autoTimerRef = useRef(null);

  const AUTO_TIMEOUT_MS = 60_000; // 1 min demo timeout

  // === Fetch Data ===
  const fetchTodayStatus = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/attendance/today`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSummary(res.data);
    } catch (err) {
      console.error("Failed to fetch today status:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          err?.response?.data?.message ||
          "Failed to fetch today's attendance record.",
      });
    } finally {
      setLoading(false);
    }
  };

  // === Mark Attendance ===
  const handleMarkAttendance = async (status, method) => {
    if (marking) return;
    if (summary?.record) {
      Swal.fire({
        icon: "info",
        title: "Already marked",
        text: "You have already marked attendance for today.",
      });
      return;
    }

    try {
      setMarking(true);
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/attendance/mark`,
        { status, method },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire({
        icon: "success",
        title: "Marked",
        text: data.message || "Attendance marked successfully.",
        confirmButtonColor: "#2563EB",
      });

      await fetchTodayStatus();
    } catch (err) {
      console.error("Error marking attendance:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          err?.response?.data?.message ||
          "Failed to mark attendance. Try again.",
        confirmButtonColor: "#DC2626",
      });
    } finally {
      setMarking(false);
    }
  };

  // === Auto Mark Logic ===
  useEffect(() => {
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);

    if (!summary?.record) {
      autoTimerRef.current = setTimeout(() => {
        handleMarkAttendance("Attend", "auto");
      }, AUTO_TIMEOUT_MS);
    }

    return () => clearTimeout(autoTimerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summary]);

  // === Real-Time Sync ===
  usePolish({
    "attendance-change": fetchTodayStatus,
    "user-change": fetchTodayStatus,
  });

  useEffect(() => {
    if (token) fetchTodayStatus();
  }, [token]);

  // === Loading Screen ===
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-600">
        <LoadingSpinner size="lg" className="mb-4" />
        <p className="text-lg font-medium">Fetching your dashboard data...</p>
      </div>
    );
  }

  // === Chart Data ===
  const present = summary?.monthlySummary?.presentDays ?? 0;
  const absent = summary?.monthlySummary?.absentDays ?? 0;
  const ratio = summary?.monthlySummary?.attendanceRatio ?? 0;

  const pieData = {
    labels: ["Present Days", "Absent Days"],
    datasets: [
      {
        data: [present, absent],
        backgroundColor: ["#70b698" , "#F97316"], // primary & secondary
        hoverBackgroundColor: ["#2563EB", "#EA580C"],
        borderColor: "#fff",
        borderWidth: 2,
      },
    ],
  };

  const pieOptions = {
    animation: { duration: 700, easing: "easeInOutQuart" },
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: "#374151", font: { size: 14 } },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const total = present + absent;
            const value = context.raw;
            const percentage = total ? ((value / total) * 100).toFixed(1) : 0;
            return `${context.label}: ${value} days (${percentage}%)`;
          },
        },
      },
    },
  };

  // === Render ===
  return (
   <div className="p-6 space-y-10">
  <PageHeader
    title="Dashboard"
    subtitle="Your real-time attendance overview."
  />

  {/* Today's Attendance */}
  <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition hover:shadow-lg">
    <div>
      <h3 className="text-lg font-semibold text-primary">
        Today: {summary?.date}
      </h3>
      <p className="text-sm text-gray-600 mt-1">
        Status:{" "}
        <span
          className={`font-semibold ${
            summary?.status === "Attend"
              ? "text-green-600"
              : summary?.status === "Absence"
              ? "text-red-600"
              : "text-gray-700"
          }`}
        >
          {summary?.status || "Not marked"}
        </span>
      </p>
    </div>

    <div className="flex items-center gap-3">
      {!summary?.record ? (
        <>
          <button
            onClick={() => handleMarkAttendance("Attend", "manual")}
            disabled={marking}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50 transition"
          >
            {marking ? "Marking..." : "Mark Attend"}
          </button>
          <button
            onClick={() => handleMarkAttendance("Absence", "manual")}
            disabled={marking}
            className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-secondary/90 disabled:opacity-50 transition"
          >
            Mark Absence
          </button>
          <p className="text-xs text-gray-500 ml-2">
            Auto-mark in {Math.round(AUTO_TIMEOUT_MS / 1000)}s if no action.
          </p>
        </>
      ) : (
        <div className="text-sm text-gray-600">
          Marked by:{" "}
          <span className="font-medium">{summary.record?.method || "manual"}</span>
        </div>
      )}
    </div>
  </div>

  {/* Stats Cards */}
  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
    <StatsCard
      label="Today's Status"
      value={summary?.status || "Not marked"}
      icon={FaUserCheck}
      color={summary?.status === "Attend" ? "green" : "red"}
    />
    <StatsCard label="Present Days" value={present} icon={FaCalendarCheck} color="blue" />
    <StatsCard label="Attendance Ratio" value={`${ratio}%`} icon={FaChartPie} color="indigo" />
  </div>

  {/* Pie Chart */}
  <div className="mt-10 bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8 transition hover:shadow-lg">
    <div className="flex-1">
      <h2 className="text-lg font-semibold text-primary mb-3">
        Monthly Attendance Overview
      </h2>
      <p className="text-gray-600 text-sm mb-4">
        Visual summary of your monthly attendance — updates live.
      </p>
      <div className="w-64 h-64 mx-auto md:mx-0">
        <Pie key={ratio} data={pieData} options={pieOptions} />
      </div>
    </div>

    <div className="flex-1 grid sm:grid-cols-3 gap-4 w-full">
      <div className="p-4 rounded-lg text-center shadow-sm bg-primary/10 border border-primary/20 transition hover:shadow-md">
        <p className="text-sm text-gray-500">Present</p>
        <p className="text-2xl font-bold text-primary">{present}</p>
      </div>
      <div className="p-4 rounded-lg text-center shadow-sm bg-secondary/10 border border-secondary/20 transition hover:shadow-md">
        <p className="text-sm text-gray-500">Absent</p>
        <p className="text-2xl font-bold text-secondary">{absent}</p>
      </div>
      <div className="p-4 rounded-lg text-center shadow-sm bg-green-50 border border-green-200 transition hover:shadow-md">
        <p className="text-sm text-gray-500">Ratio</p>
        <p className="text-2xl font-bold text-green-600">{ratio}%</p>
      </div>
    </div>
  </div>
</div>

  );
};

export default DashboardHome;

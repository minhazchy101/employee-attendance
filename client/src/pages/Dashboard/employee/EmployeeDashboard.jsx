import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useAppContext } from "../../../context/AppContext";
import { usePolish } from "../../../hooks/usePolish";
import LoadingSpinner from "../../../components/reusable/LoadingSpinner";
import PageHeader from "../../../components/reusable/PageHeader";
import {
  FaUserCheck,
  FaCalendarTimes,
  FaCalendarDay,
  FaChartPie,
  FaUmbrellaBeach,
} from "react-icons/fa";

ChartJS.register(ArcElement, Tooltip, Legend);

const EmployeeDashboard = () => {
  const { token } = useAppContext();
  const API = import.meta.env.VITE_API_URL;

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [marking, setMarking] = useState(false);

  /** Fetch Today’s Attendance (support both full + realtime update) */
  const fetchTodayStatus = async (isRealtime = false) => {
    try {
      if (isRealtime) setUpdating(true);
      else setLoading(true);

      const res = await axios.get(`${API}/api/attendance/today`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSummary(res.data);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: err?.response?.data?.message || "Unable to load attendance data.",
      });
    } finally {
      if (isRealtime) setUpdating(false);
      else setLoading(false);
    }
  };

  /** Mark Attendance */
  const handleMarkAttendance = async () => {
    try {
      setMarking(true);
      const res = await axios.post(`${API}/api/attendance/mark`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Swal.fire({
        icon: "success",
        title: "Marked Successfully",
        text: res.data.message,
      });
      fetchTodayStatus(true);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.response?.data?.message || "Failed to mark attendance.",
      });
    } finally {
      setMarking(false);
    }
  };

  /** Real-time socket updates */
  usePolish({
    "attendance-change": () => fetchTodayStatus(true),
    "leave-status-change": () => fetchTodayStatus(true),
  });

  /** Load data on mount */
  useEffect(() => {
    if (token) fetchTodayStatus();
  }, [token]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <LoadingSpinner />
        <p className="text-gray-600 mt-4">Loading dashboard...</p>
      </div>
    );

  // Extract data
  const { date, status, record, monthlySummary, remainingHoliday } = summary || {};
  const {
    presentDays = 0,
    authorizedLeave = 0,
    offDays = 0,
    unauthorized = 0,
    attendanceRatio = 0,
  } = monthlySummary || {};

  /** Pie Chart Data */
  const pieData = {
    labels: ["Present", "Authorized Leave", "Off Day", "Unauthorized Leave"],
    datasets: [
      {
        data: [presentDays, authorizedLeave, offDays, unauthorized],
        backgroundColor: ["#10B981", "#60A5FA", "#FACC15", "#EF4444"],
        hoverBackgroundColor: ["#059669", "#3B82F6", "#EAB308", "#DC2626"],
        borderColor: "#fff",
        borderWidth: 2,
      },
    ],
  };

  const pieOptions = {
    plugins: { legend: { position: "bottom" } },
    animation: { duration: 800 },
  };

  const statusColor =
    {
      attended: "text-green-600 bg-green-100",
      "authorized leave": "text-blue-600 bg-blue-100",
      "unauthorized leave": "text-red-600 bg-red-100",
      "off day": "text-yellow-600 bg-yellow-100",
      pending: "text-gray-600 bg-gray-100",
      "not marked": "text-gray-500 bg-gray-50",
    }[status?.toLowerCase()] || "text-gray-600 bg-gray-100";

  return (
    <div className="p-6 space-y-10 transition-all duration-300">
      <PageHeader
        title="Employee Dashboard"
        subtitle="Track your attendance and leave balance"
      />

      {updating && (
        <div className="flex justify-center items-center">
          <p className="text-sm text-gray-400 animate-pulse">
             Updating...
          </p>
        </div>
      )}

      {/* Today’s Attendance */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition relative">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              Today: <span className="text-indigo-600">{date}</span>
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Status:{" "}
              <span
                className={`px-2 py-1 rounded-md text-sm font-medium ${statusColor}`}
              >
                {status || "Not marked"}
              </span>
            </p>

            {record?.reason && (
              <p className="mt-1 text-sm text-gray-500">
                Reason: <b>{record.reason}</b>
              </p>
            )}
          </div>

          {status === "off day" ? (
            <p className="text-yellow-600 font-medium">
              🌞 Weekly off — enjoy your day!
            </p>
          ) : status === "authorized leave" ? (
            <p className="text-blue-600 font-medium">
              🏖 Approved leave — no attendance required.
            </p>
          ) : record ? (
            <p className="text-gray-500 text-sm">
              Marked via <b>{record.method}</b>
            </p>
          ) : (
            <button
              onClick={handleMarkAttendance}
              disabled={marking}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-lg transition disabled:opacity-60"
            >
              {marking ? "Marking..." : "Mark Attendance"}
            </button>
          )}
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <SummaryCard
          icon={<FaUserCheck />}
          label="Present"
          value={presentDays}
          color="bg-green-100 text-green-700"
        />
        <SummaryCard
          icon={<FaCalendarDay />}
          label="Off Days"
          value={offDays}
          color="bg-yellow-100 text-yellow-700"
        />
        <SummaryCard
          icon={<FaUmbrellaBeach />}
          label="Remaining Leave"
          value={remainingHoliday ?? 28}
          color="bg-purple-100 text-purple-700"
        />
        <SummaryCard
          icon={<FaCalendarTimes />}
          label="Unauthorized"
          value={unauthorized}
          color="bg-red-100 text-red-700"
        />
        <SummaryCard
          icon={<FaChartPie />}
          label="Attendance Ratio"
          value={`${attendanceRatio}%`}
          color="bg-indigo-100 text-indigo-700"
        />
      </div>

      {/* Pie Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Monthly Attendance Breakdown
        </h3>
        <div className="flex justify-center items-center">
          <div className="w-64 h-64">
            <Pie data={pieData} options={pieOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

/** Reusable Summary Card */
const SummaryCard = ({ icon, label, value, color }) => (
  <div className="flex flex-col items-center justify-center rounded-xl p-6 bg-white border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
    <div
      className={`${color} w-14 h-14 flex items-center justify-center rounded-full text-xl mb-3`}
    >
      {icon}
    </div>
    <p className="text-sm text-gray-500">{label}</p>
    <p className="text-2xl font-semibold text-gray-800">{value}</p>
  </div>
);

export default EmployeeDashboard;

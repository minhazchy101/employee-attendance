import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import PageHeader from "../../components/reusable/PageHeader";
import StatsCard from "../../components/reusable/StatsCard";
import LoadingSpinner from "../../components/reusable/LoadingSpinner";
import { useAppContext } from "../../context/AppContext";
import { usePolish } from "../../hooks/usePolish";

/**
 * DashboardHome
 * - Shows today's status, monthly ratio (from API)
 * - Allows marking attendance (Attend / Absence)
 * - Auto-marks as "Attend" after AUTO_TIMEOUT_MS if user doesn't respond
 *
 * NOTE: For development/testing AUTO_TIMEOUT_MS is short (1 minute).
 * For production set it to 24 * 60 * 60 * 1000 (24 hours).
 */
const DashboardHome = () => {
  const { token } = useAppContext();
  const [summary, setSummary] = useState(null);      // response from /api/attendance/today
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const autoTimerRef = useRef(null);

  // Timeout after which we auto-mark as "Attend"
  // DEV: set to 60_000 (1 minute) or 10_000 (10s) for demo.
  // PROD: set to 24 * 60 * 60 * 1000 (24 hours).
  const AUTO_TIMEOUT_MS = 60_000; // <-- change to desired value

  // Fetch today's status + monthly summary
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

  // Mark attendance (status: "Attend" | "Absence", method: "manual" | "auto")
  const handleMarkAttendance = async (status , method) => {
    console.log('status : ' , status)
    if (marking) return;
    if (summary?.record) {
      // Already marked today
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

      // Refresh summary which includes record & monthlySummary
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

  // Auto mark logic — set/reset timer whenever summary changes
  useEffect(() => {
    // clear previous timer
    if (autoTimerRef.current) {
      clearTimeout(autoTimerRef.current);
      autoTimerRef.current = null;
    }

    // if not marked yet, schedule auto-mark
    if (!summary?.record) {
      autoTimerRef.current = setTimeout(() => {
        // Auto-mark as Attend with method 'auto'
        handleMarkAttendance("Attend", "auto");
      }, AUTO_TIMEOUT_MS);
    }

    // cleanup on unmount
    return () => {
      if (autoTimerRef.current) {
        clearTimeout(autoTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summary]); // re-run whenever today's summary changes

  // Listen for realtime attendance-change events and refresh
  usePolish({
    "attendance-change": () => {
      fetchTodayStatus();
    },
    "user-change": () => {
      // optionally refresh summary on user changes (role approvals)
      fetchTodayStatus();
    },
  });

  // initial load
  useEffect(() => {
    if (!token) return;
    fetchTodayStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (loading) return <LoadingSpinner size="md" />;

  console.log(summary)
  return (
    <div className="p-6">
      <PageHeader title="Dashboard" subtitle="Today overview & monthly ratio." />

      <div className="grid md:grid-cols-3 gap-6">
        <StatsCard label="My Today Status" value={summary?.status || "Not marked"} />
        <StatsCard
          label="Present Days (this month)"
          value={summary?.monthlySummary?.presentDays ?? "--"}
        />
        <StatsCard
          label="Attendance Ratio"
          value={`${summary?.monthlySummary?.attendanceRatio ?? 0}%`}
        />
      </div>

      <div className="mt-8">
        <div className="bg-white p-6 rounded-lg shadow flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-medium">
              Today: {summary?.date}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Status:{" "}
              <span className={`font-semibold ${summary?.status === "Attend" ? "text-green-600" : summary?.status === "Absence" ? "text-red-600" : "text-gray-700"}`}>
                {summary?.status || "Not marked"}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Show mark button only if not already recorded */}
            {!summary?.record ? (
              <>
                <button
                  onClick={() => handleMarkAttendance("Attend", "manual")}
                  disabled={marking}
                  className="bg-primary text-white px-4 py-2 rounded hover:opacity-90 disabled:opacity-50"
                >
                  {marking ? "Marking..." : "Mark Attend"}
                </button>

                <button
                  onClick={() => handleMarkAttendance("Absence", "manual")}
                  disabled={marking}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:opacity-90 disabled:opacity-50"
                >
                  Mark Absence
                </button>

                <p className="text-xs text-gray-500 ml-2">You will be auto-marked in {Math.round(AUTO_TIMEOUT_MS/1000)}s if no action.</p>
              </>
            ) : (
              <div className="text-sm text-gray-600">Marked by: <span className="font-medium">{summary.record?.method || "manual"}</span></div>
            )}
          </div>
        </div>

        {/* Monthly summary box (simple fallback before chart) */}
        <div className="mt-6 bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3">Monthly Attendance Ratio</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 border rounded">
              <p className="text-sm text-gray-500">Present Days</p>
              <p className="text-xl font-semibold">{summary?.monthlySummary?.presentDays ?? "--"}</p>
            </div>
            <div className="p-4 border rounded">
              <p className="text-sm text-gray-500">Absent Days</p>
              <p className="text-xl font-semibold">{summary?.monthlySummary?.absentDays ?? "--"}</p>
            </div>
            <div className="p-4 border rounded">
              <p className="text-sm text-gray-500">Attendance Ratio</p>
              <p className="text-xl font-semibold">{summary?.monthlySummary?.attendanceRatio ?? 0}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;

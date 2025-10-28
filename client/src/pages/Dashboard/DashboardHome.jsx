import React, { useEffect, useState } from "react";
import axios from "axios"; // ✅ direct import like AuthModal
import Swal from "sweetalert2";
import { useAppContext } from "../../context/AppContext";
import { usePolish } from "../../hooks/usePolish";
import LoadingSpinner from "../../components/reusable/LoadingSpinner";

const DashboardHome = () => {
  const { profile } = useAppContext();
  const [todayStatus, setTodayStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  usePolish("attendance-change", () => fetchTodayStatus());

  const fetchTodayStatus = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/attendance/today`
      );
      setTodayStatus(data);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          err.response?.data?.message ||
          "Failed to fetch today's attendance record.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async () => {
  try {
    const { data } = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/attendance/mark`,
      {
        userEmail: profile?.email,
        status: "Attend", // ✅ must match the enum exactly
      }
    );

    Swal.fire({
      icon: "success",
      title: "Marked!",
      text: data.message || "Attendance marked successfully.",
      confirmButtonColor: "#2563EB",
    });

    fetchTodayStatus();
  } catch (err) {
    console.error("Error marking attendance:", err);
    Swal.fire({
      icon: "error",
      title: "Error",
      text:
        err.response?.data?.message ||
        "Failed to mark attendance.",
      confirmButtonColor: "#DC2626",
    });
  }
};


  useEffect(() => {
    fetchTodayStatus();
  }, []);
  console.log(todayStatus?.record?.userEmail)
  console.log(profile?.email)

  if (loading) return <LoadingSpinner className="md"/>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">
        Welcome, {profile?.fullName} 

      </h2>

      <div className="bg-white shadow p-4 rounded-lg">
        <p className="text-gray-700 mb-2">
          Today’s Status:{" "}
          <span className="font-semibold text-blue-600">
            {todayStatus?.status || "Not Marked"}
          </span>
        </p>
        {profile?.email !== todayStatus?.record?.userEmail  && (
          <button
            onClick={handleMarkAttendance}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Mark Attendance
          </button>
        )}
      </div>
    </div>
  );
};

export default DashboardHome;

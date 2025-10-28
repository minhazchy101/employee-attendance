import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAppContext } from "../../../context/AppContext";
import { usePolish } from "../../../hooks/usePolish";
import PageHeader from "../../../components/reusable/PageHeader";
import LoadingSpinner from "../../../components/reusable/LoadingSpinner";

const EmployeeDashboard = () => {
  const { token, user , profile} = useAppContext();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAttendance = async () => {
    try {
      const month = new Date().toISOString().slice(0, 7); // e.g. "2025-10"
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/attendance/my?month=${month}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAttendance(data);
    } catch (err) {
      console.error("Failed to fetch attendance:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [token]);

 usePolish({
  "attendance-change": (payload) => {
    // Only refetch if it's this user
    if (payload?.userEmail === profile?.email) {
      console.log("my attendance was changed remotely", payload);
      fetchAttendance(); // your function that GETs /api/attendance/my
    }
  },
});

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6">
      <PageHeader title="Employee Dashboard" subtitle="Your attendance overview." />

    <div className="flex gap-3 mb-4">
  <button
    onClick={async () => {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/attendance/check-in`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchAttendance();
    }}
    className="bg-green-600 text-white px-4 py-2 rounded"
  >
    Check In
  </button>
  <button
    onClick={async () => {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/attendance/check-out`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchAttendance();
    }}
    className="bg-blue-600 text-white px-4 py-2 rounded"
  >
    Check Out
  </button>
</div>


      <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-100">
        <h3 className="text-lg font-medium mb-4 text-gray-700">Recent Attendance</h3>

        <ul className="divide-y">
          {attendance.map((a) => (
            <li key={a._id} className="py-2 flex justify-between text-gray-600">
              <span>{new Date(a.date).toDateString()}</span>
              <span className={`font-semibold ${a.status === "Present" ? "text-green-600" : "text-red-500"}`}>
                {a.status}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default EmployeeDashboard;

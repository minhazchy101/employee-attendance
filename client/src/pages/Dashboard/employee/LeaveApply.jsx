import React, { useState, useEffect } from "react";
import { useAppContext } from "../../../context/AppContext";
import { usePolish } from "../../../hooks/usePolish";
import { FaPlaneDeparture } from "react-icons/fa";
import PageHeader from "../../../components/reusable/PageHeader";
import LoadingSpinner from "../../../components/reusable/LoadingSpinner";
import axios from "axios";

const LeaveApply = () => {
  const { profile, token } = useAppContext();
  const [form, setForm] = useState({
    reasonType: "holiday",
    description: "",
    startDate: "",
    endDate: "",
  });
  const [myLeaves, setMyLeaves] = useState([]);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const fetchMyLeaves = async () => {
    setFetching(true);
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/leave/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyLeaves(Array.isArray(data.leaves) ? data.leaves : []);
    } catch (err) {
      console.error("Failed to fetch leaves:", err);
      setMyLeaves([]);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchMyLeaves();
  }, [token]);

  usePolish({
    "leave-status-change": (updatedLeave) => {
      if (updatedLeave.userEmail === profile.email) {
        setMyLeaves((prev) =>
          prev.map((leave) =>
            leave._id === updatedLeave._id ? updatedLeave : leave
          )
        );
      }
    },
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    if (!form.startDate || !form.endDate) {
      setMessage({ text: "Start and end date are required", type: "error" });
      setLoading(false);
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/leave/submit`,
        { ...form },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage({ text: "Leave request submitted successfully!", type: "success" });
      setForm({ reasonType: "holiday", description: "", startDate: "", endDate: "" });
      fetchMyLeaves();
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || "Failed to submit leave",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <PageHeader
        title="Apply for Leave"
        subtitle="Submit your leave request and track its status"
        icon={<FaPlaneDeparture className="text-[var(--color-primary)] text-2xl" />}
      />

      {message.text && (
        <div
          className={`p-3 rounded-md text-sm font-medium shadow ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Leave Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 shadow-md rounded-xl space-y-6 border border-gray-200 transition hover:shadow-lg"
      >
        <div className="grid sm:grid-cols-2 gap-5">
          {/* Reason */}
          <div>
            <label className="block mb-2 text-gray-700 font-medium">Reason</label>
            <select
              name="reasonType"
              value={form.reasonType}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] p-2 transition"
            >
              <option value="holiday">Holiday</option>
              <option value="sick">Sick</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block mb-2 text-gray-700 font-medium">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Optional reason..."
              rows={2}
              className="w-full border border-gray-300 rounded-lg focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] p-2 transition resize-none"
            />
          </div>

          {/* Start Date */}
          <div>
            <label className="block mb-2 text-gray-700 font-medium">Start Date</label>
            <input
              type="date"
              name="startDate"
              min={new Date().toISOString().split("T")[0]}
              value={form.startDate}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] p-2 transition"
              required
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block mb-2 text-gray-700 font-medium">End Date</label>
            <input
              type="date"
              name="endDate"
              min={form.startDate || new Date().toISOString().split("T")[0]}
              value={form.endDate}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] p-2 transition"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`mt-2 w-full sm:w-auto bg-[var(--color-primary)] hover:bg-[var(--color-secondary)] text-white font-semibold py-2 px-6 rounded-lg transition flex items-center justify-center ${
            loading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {loading ? <LoadingSpinner /> : "Submit Request"}
        </button>
      </form>

      {/* My Leaves */}
      <div className="bg-white shadow-md rounded-xl p-6 border border-gray-200">
        <h3 className="font-semibold text-gray-800 text-lg mb-4">My Leaves</h3>
        {fetching ? (
          <div className="flex justify-center py-10">
            <LoadingSpinner />
          </div>
        ) : myLeaves.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">No leave records found.</p>
        ) : (
          <div className="space-y-4">
            {myLeaves.map((leave) => (
              <div
                key={leave._id}
                className="flex justify-between items-center p-4 border rounded-lg bg-gray-50 hover:bg-white hover:shadow-md transition"
              >
                <div className="space-y-1">
                  <p className="font-medium capitalize text-[var(--color-primary-dull)]">{leave.reasonType}</p>
                  <p className="text-sm text-gray-600">{leave.description || "—"}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(leave.startDate).toLocaleDateString()} → {new Date(leave.endDate).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    leave.status === "approved"
                      ? "bg-green-100 text-green-800"
                      : leave.status === "rejected"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {leave.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveApply;

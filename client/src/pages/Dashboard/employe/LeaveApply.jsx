import React, { useState, useEffect } from "react";
import { useAppContext } from "../../../context/AppContext";
import { usePolish } from "../../../hooks/usePolish";

import { FaPlaneDeparture } from "react-icons/fa";
import PageHeader from "../../../components/reusable/PageHeader";
import LoadingSpinner from "../../../components/reusable/LoadingSpinner";

const LeaveApply = () => {
  const { axios, profile, token } = useAppContext();
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

  // Fetch my leaves
  const fetchMyLeaves = async () => {
    setFetching(true);
    try {
      const { data } = await axios.get("/api/leave/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data?.leaves && Array.isArray(data.leaves)) setMyLeaves(data.leaves);
      else setMyLeaves([]);
    } catch (err) {
      console.error(err);
      setMyLeaves([]);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchMyLeaves();
  }, []);

  // Real-time updates
  usePolish({
    "leave:update": (updatedLeave) => {
      if (updatedLeave.userEmail === profile.email) {
        setMyLeaves((prev) =>
          prev.map((leave) =>
            leave._id === updatedLeave._id ? updatedLeave : leave
          )
        );
      }
    },
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    // Basic validation
    if (!form.startDate || !form.endDate) {
      setMessage({ text: "Start and end date are required", type: "error" });
      setLoading(false);
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/leave/submit`,
        { ...form }, // backend uses req.user for email & fullName
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage({
        text: "Leave request submitted successfully!",
        type: "success",
      });
      setForm({ reasonType: "holiday", description: "", startDate: "", endDate: "" });
      fetchMyLeaves();
    } catch (err) {
      console.error(err);
      setMessage({
        text: err.response?.data?.message || err.message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  console.log('myLeaves : ', myLeaves)

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-6">
      <PageHeader
        title="Apply for Leave"
        subtitle="Submit your leave request and track its status"
        icon={<FaPlaneDeparture />}
      />

      {/* Status message */}
      {message.text && (
        <div
          className={`p-3 rounded-md text-sm ${
            message.type === "success"
              ? "bg-green-100 text-green-700 border border-green-300"
              : "bg-red-100 text-red-700 border border-red-300"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Form Section */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-6 flex flex-col gap-4 border border-gray-100"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Reason</label>
            <select
              name="reasonType"
              value={form.reasonType}
              onChange={handleChange}
              className="w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="holiday">Holiday</option>
              <option value="sick">Sick</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Brief reason..."
              rows={2}
              className="w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Start Date</label>
            <input
              type="date"
              name="startDate"
              min={new Date().toISOString().split("T")[0]}
              value={form.startDate}
              onChange={handleChange}
              required
              className="w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">End Date</label>
            <input
              type="date"
              name="endDate"
              min={form.startDate || new Date().toISOString().split("T")[0]}
              value={form.endDate}
              onChange={handleChange}
              required
              className="w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`mt-2 w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md transition ${
            loading && "opacity-70 cursor-not-allowed"
          }`}
        >
          {loading ? <LoadingSpinner /> : "Submit Request"}
        </button>
      </form>

      {/* Leave History */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-3 text-lg">My Leaves</h3>
        {fetching ? (
          <LoadingSpinner />
        ) : myLeaves.length === 0 ? (
          <p className="text-gray-500 text-sm">No leave records found.</p>
        ) : (
          <div className="space-y-3">
            {myLeaves.map((leave) => (
              <div
                key={leave._id}
                className="border border-gray-200 bg-gray-50 rounded-md p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium text-gray-700 capitalize">{leave.reasonType}</p>
                  <p className="text-sm text-gray-500">{leave.description}</p>
                  <p className="text-xs text-gray-500">
                    {leave.startDate} → {leave.endDate}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    leave.status === "approved"
                      ? "bg-green-100 text-green-700"
                      : leave.status === "rejected"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
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

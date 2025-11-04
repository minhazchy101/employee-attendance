import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAppContext } from "../../../context/AppContext";
import LoadingSpinner from "../../../components/reusable/LoadingSpinner";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";

const AdminHolidays = () => {
  const { token } = useAppContext();
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formVisible, setFormVisible] = useState(false);
  const [formData, setFormData] = useState({ name: "", date: "", description: "" });
  const [editingId, setEditingId] = useState(null);

  const API = import.meta.env.VITE_API_URL;

  /** Fetch all holidays */
  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API}/api/holidays`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHolidays(data.holidays);
    } catch (err) {
      console.error("Failed to fetch holidays:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, [token]);

  /** Handle form input changes */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /** Add or update holiday */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.name || !formData.date) {
        alert("Name and Date are required");
        return;
      }

      if (editingId) {
        // Update holiday
        await axios.put(`${API}/api/holidays/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        // Add new holiday
        await axios.post(`${API}/api/holidays/add`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setFormData({ name: "", date: "", description: "" });
      setEditingId(null);
      setFormVisible(false);
      fetchHolidays();
    } catch (err) {
      console.error("Failed to save holiday:", err);
      alert(err.response?.data?.message || "Error saving holiday");
    }
  };

  /** Delete holiday */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this holiday?")) return;
    try {
      await axios.delete(`${API}/api/holidays/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchHolidays();
    } catch (err) {
      console.error("Failed to delete holiday:", err);
      alert("Error deleting holiday");
    }
  };

  /** Edit holiday */
  const handleEdit = (holiday) => {
    setFormData({
      name: holiday.name,
      date: holiday.date.slice(0, 10), // format for input type=date
      description: holiday.description || "",
    });
    setEditingId(holiday._id);
    setFormVisible(true);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="bg-white shadow-md rounded p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-700">Manage Holidays</h2>
        <button
          className="flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          onClick={() => {
            setFormVisible(!formVisible);
            setEditingId(null);
            setFormData({ name: "", date: "", description: "" });
          }}
        >
          <FaPlus className="mr-2" /> {formVisible ? "Cancel" : "Add Holiday"}
        </button>
      </div>

      {formVisible && (
        <form className="mb-6 space-y-4" onSubmit={handleSubmit}>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              name="name"
              placeholder="Holiday Name"
              value={formData.name}
              onChange={handleChange}
              className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
          <textarea
            name="description"
            placeholder="Description (optional)"
            value={formData.description}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            {editingId ? "Update Holiday" : "Add Holiday"}
          </button>
        </form>
      )}

      {holidays.length === 0 ? (
        <p className="text-gray-500">No holidays found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2 text-left">Name</th>
                <th className="border px-4 py-2 text-left">Date</th>
                <th className="border px-4 py-2 text-left">Description</th>
                <th className="border px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {holidays.map((holiday) => (
                <tr key={holiday._id} className="hover:bg-gray-50">
                  <td className="border px-4 py-2">{holiday.name}</td>
                  <td className="border px-4 py-2">{holiday.date.slice(0, 10)}</td>
                  <td className="border px-4 py-2">{holiday.description || "-"}</td>
                  <td className="border px-4 py-2 text-center space-x-2">
                    <button
                      onClick={() => handleEdit(holiday)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(holiday._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminHolidays;

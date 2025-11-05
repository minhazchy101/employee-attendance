import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAppContext } from "../../../context/AppContext";
import LoadingSpinner from "../../../components/reusable/LoadingSpinner";
import PageHeader from "../../../components/reusable/PageHeader";

const ProfileDetails = () => {
  const { email } = useParams();
  const { token } = useAppContext();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/users/profile/${email}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(data.user);
    } catch (err) {
      console.error("Error fetching user:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (email && token) fetchUser();
  }, [email, token]);

  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    return new Date(timestamp).toLocaleDateString();
  };

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );

  if (!user)
    return <p className="text-center py-20 text-gray-500">User not found</p>;

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <PageHeader title={user.fullName} subtitle="Employee Profile Details" />

      <div className="bg-white shadow-xl rounded-2xl p-6 md:p-8 mt-6 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center gap-6 border-b pb-6">
          <img
            src={user.image}
            alt={user.fullName}
            className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-primary"
          />
          <div className="flex-1 space-y-2 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold text-primary">{user.fullName}</h2>
            <p className="text-secondary text-lg">{user.jobTitle || "Employee"}</p>
            <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-2 md:gap-3 mt-2">
              <span
                className={`px-4 py-1 rounded-full font-semibold text-sm ${
                  user.status === "active"
                    ? "bg-primary text-white"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {user.status.toUpperCase()}
              </span>
              <span className="px-3 py-1 rounded-full bg-secondary/20 text-secondary text-sm font-medium">
                {user.role.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Basic & Job Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 border-b pb-6">
          <div className="space-y-3">
            <p>
              <strong className="text-secondary">Email:</strong> {user.email}
            </p>
            <p>
              <strong className="text-secondary">Phone:</strong> {user.phoneNumber || "-"}
            </p>
            <p>
              <strong className="text-secondary">Address:</strong> {user.address || "-"}
            </p>
            <p>
              <strong className="text-secondary">NI Number:</strong> {user.niNumber || "-"}
            </p>
            <p>
              <strong className="text-secondary">Passport Number:</strong> {user.passportNumber || "-"}
            </p>
            <p>
              <strong className="text-secondary">Passport Expiry:</strong> {formatDate(user.passportExpireDate)}
            </p>
          </div>
          <div className="space-y-3">
            <p>
              <strong className="text-secondary">Join Date:</strong> {formatDate(user.joinDate)}
            </p>
            <p>
              <strong className="text-secondary">Job Start Date:</strong> {formatDate(user.jobStartDate)}
            </p>
            <p>
              <strong className="text-secondary">Weekly Hours:</strong> {user.weeklyHours} hrs
            </p>
            <p>
              <strong className="text-secondary">Hourly Rate:</strong> ${user.hourlyRate}
            </p>
            <p>
              <strong className="text-secondary">Annual Wages:</strong> ${user.annualWages}
            </p>
            <p>
              <strong className="text-secondary">Off Day:</strong> {user.offDay || "-"}
            </p>
          </div>
        </div>

        {/* Emergency Contacts */}
        {user.emergencyContacts?.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-semibold text-primary mb-2">Emergency Contacts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user.emergencyContacts.map((contact, i) => (
                <div
                  key={i}
                  className="p-4 border border-secondary/30 rounded-xl shadow-sm hover:shadow-md transition"
                >
                  <p>
                    <strong className="text-secondary">Name:</strong> {contact.fullName}
                  </p>
                  <p>
                    <strong className="text-secondary">Relationship:</strong> {contact.relationship}
                  </p>
                  <p>
                    <strong className="text-secondary">Email:</strong> {contact.email}
                  </p>
                  <p>
                    <strong className="text-secondary">Phone:</strong> {contact.contactNumber}
                  </p>
                  <p className="text-gray-500 mt-2 text-sm md:text-base">
                    {contact.address}, {contact.townCity}, {contact.postcode}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex justify-center md:justify-start gap-3">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 rounded-xl bg-secondary text-white font-semibold hover:bg-secondary/80 transition"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetails;

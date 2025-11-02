import React, { useEffect, useState } from "react";
import { useAppContext } from "../../../context/AppContext";
import { updateProfile } from "firebase/auth";
import Swal from "sweetalert2";
import axios from "axios";
import { auth } from "../../../firebase/firebase.config";
import LoadingSpinner from "../../../components/reusable/LoadingSpinner";
import PageHeader from "../../../components/reusable/PageHeader";
import { usePolish } from "../../../hooks/usePolish";

const Profile = () => {
  const {  profile, token, fetchUserProfile } = useAppContext();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load initial data
  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || "",
        jobTitle: profile.jobTitle || "",
        phoneNumber: profile.phoneNumber || "",
        niNumber: profile.niNumber || "",
        image: profile.image || "",
      });
      setLoading(false);
    }
  }, [profile]);

  // 🔹 Real-time profile update listener
  usePolish({
    "user-change": ({ user: changedUser }) => {
      if (changedUser?.email === profile?.email) {
        fetchUserProfile(profile.email);
      }
    },
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData((prev) => ({ ...prev, image: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // ✅ Update Firebase Display Name
      if (auth.currentUser && formData.fullName) {
        await updateProfile(auth.currentUser, { displayName: formData.fullName });
      }

      // ✅ Prepare FormData for backend
      const updatedData = new FormData();
      updatedData.append("fullName", formData.fullName);
      updatedData.append("jobTitle", formData.jobTitle);
      updatedData.append("phoneNumber", formData.phoneNumber);
      updatedData.append("niNumber", formData.niNumber);
      if (formData.image instanceof File) {
        updatedData.append("image", formData.image);
      }

      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/users/update-profile/${profile._id}`,
        updatedData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire({
        position: "center",
        icon: "success",
        title: "Profile updated successfully!",
        showConfirmButton: false,
        timer: 1200,
      });

      fetchUserProfile(profile.email);
    } catch (error) {
      console.error(error);
      Swal.fire({
        position: "center",
        icon: "error",
        title: "Profile update failed!",
        text: error?.response?.data?.message || "Please try again.",
        showConfirmButton: false,
        timer: 1500,
      });
    } finally {
      setSaving(false);
    }
  };

  // === Loading State ===
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-gray-600">
        <LoadingSpinner size="lg" className="mb-3" />
        <p className="text-lg font-medium text-gray-500">
          Loading your profile...
        </p>
      </div>
    );
  }
console.log(formData.jobTitle)
  return (
    <div className="p-6">
      <PageHeader
        title="My Profile"
        subtitle="Manage your personal information and keep your details up-to-date."
      />

      <form
        onSubmit={handleSave}
        className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 mt-6 space-y-6"
      >
        {/* === Profile Image Section === */}
        <div className="flex items-center gap-6 border-b border-gray-100 pb-6">
          <img
            src={
              formData.image instanceof File
                ? URL.createObjectURL(formData.image)
                : formData.image ||
                  `https://ui-avatars.com/api/?name=${formData.fullName}&background=70b698&color=fff`
            }
            alt="Profile"
            className="w-24 h-24 object-cover rounded-full border-4 border-primary/30 hover:border-primary shadow-md transition-all duration-400"
          />
          <div >
            <label
              htmlFor="image"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Change Profile Photo
            </label>
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              onChange={handleChange}
              className="text-sm text-gray-600 p-2 rounded-lg cursor-pointer border-4 border-primary/30 hover:border-primary shadow-md transition-all duration-400"
            />
            <p className="text-xs text-gray-400 mt-1">
              Supported formats: JPG, PNG, under 5MB.
            </p>
          </div>

{formData.jobTitle === "BOSS" && <p>License</p>}
          
        </div>

        {/* === Input Fields === */}
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Job Title
            </label>
            <input
              type="text"
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-md px-3 py-2 focus:ring-2 focus:ring-secondary/40 focus:border-secondary outline-none transition"
              placeholder="e.g. Frontend Developer"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition"
              placeholder="e.g. +44 7123 456789"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">
              NI Number
            </label>
            <input
              type="text"
              name="niNumber"
              value={formData.niNumber}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-md px-3 py-2 uppercase focus:ring-2 focus:ring-secondary/40 focus:border-secondary outline-none transition"
              placeholder="AB123456C"
            />
          </div>
        </div>

        {/* === Save Button === */}
        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={saving}
            className={`px-6 py-2.5 rounded-md text-white font-medium bg-primary hover:bg-primary/90 transition shadow-sm ${
              saving ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;

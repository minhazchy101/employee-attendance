import React, { useEffect, useState } from "react";
import { useAppContext } from "../../../context/AppContext";
import { updateProfile } from "firebase/auth";
import Swal from "sweetalert2";
import axios from "axios";
import { auth } from "../../../firebase/firebase.config";
import LoadingSpinner from "../../../components/reusable/LoadingSpinner";
import PageHeader from "../../../components/reusable/PageHeader";
import { usePolish } from "../../../hooks/usePolish";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaBriefcase,
  FaCalendarAlt,
  FaPassport,
  FaRegClock,
  FaMoneyBillWave,
  FaUserShield,
  FaIdBadge,
  FaEdit,
  FaTimes,
  FaUserCircle,
} from "react-icons/fa";

const Profile = () => {
  const { profile, token, fetchUserProfile } = useAppContext();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState(null); // for modal preview only

  useEffect(() => {
    if (profile) {
      setFormData(profile);
      setLoading(false);
    }
  }, [profile]);

  usePolish({
    "user-change": ({ user: changedUser }) => {
      if (changedUser?.email === profile?.email) {
        fetchUserProfile(profile.email);
      }
    },
  });

  const handleChange = (e, index = null) => {
    const { name, value, files } = e.target;
    if (name.startsWith("emergencyContact") && index !== null) {
      const updatedContacts = [...formData.emergencyContacts];
      updatedContacts[index][name.split("-")[1]] = value;
      setFormData({ ...formData, emergencyContacts: updatedContacts });
    } else if (files) {
      const file = files[0];
      setFormData((prev) => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file)); // only for modal preview
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (auth.currentUser && formData.fullName) {
        await updateProfile(auth.currentUser, { displayName: formData.fullName });
      }

      const updatedData = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "emergencyContacts") {
          updatedData.append(key, JSON.stringify(formData[key]));
        } else if (key === "image" && formData.image instanceof File) {
          updatedData.append(key, formData.image);
        } else {
          updatedData.append(key, formData[key]);
        }
      });

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
      setModalOpen(false);
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

  const formatDate = (date) => (date ? new Date(date).toLocaleDateString() : "—");

  return (
    <div className="p-6">
      <PageHeader title="My Profile" subtitle="Manage and update your details" />

      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-10 relative overflow-hidden">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            <img
              src={
                formData.image instanceof File
                  ? formData.image
                    ? URL.createObjectURL(formData.image)
                    : profile.image
                  : formData.image ||
                    `https://ui-avatars.com/api/?name=${formData.fullName}&background=70b698&color=fff`
              }
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-primary/30 shadow-md"
            />
            <p>L</p>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-3xl font-semibold text-gray-800 flex items-center justify-center sm:justify-start gap-2">
              <FaUser className="text-primary" />
              {formData.fullName}
            </h2>
            <p className="text-secondary font-medium">{formData.jobTitle}</p>
            <p className="text-gray-500 text-sm mt-1 flex justify-center sm:justify-start items-center gap-2">
              <FaEnvelope /> {formData.email}
            </p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
              <span className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                <FaUserShield /> {formData.status}
              </span>
              <span className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full flex items-center gap-1">
                <FaIdBadge /> {formData.role}
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              setModalOpen(true);
              setImagePreview(
                formData.image instanceof File
                  ? URL.createObjectURL(formData.image)
                  : formData.image || null
              );
            }}
            className="absolute top-6 right-6 px-4 py-2.5 flex items-center gap-2 text-sm font-medium bg-primary text-white rounded-md shadow hover:bg-primary/90 transition"
          >
            <FaEdit /> Edit
          </button>
        </div>

        <hr className="my-8 border-gray-200" />

        {/* Info Sections */}
        <div className="grid md:grid-cols-2 gap-6">
          <ProfileCard title="Personal Info" icon={<FaUser />}>
            <ProfileField icon={<FaPhone />} label="Phone" value={formData.phoneNumber} />
            <ProfileField icon={<FaMapMarkerAlt />} label="Address" value={formData.address} />
            <ProfileField icon={<FaIdBadge />} label="NI Number" value={formData.niNumber} />
            <ProfileField icon={<FaCalendarAlt />} label="Off Day" value={formData.offDay} />
          </ProfileCard>

          <ProfileCard title="Job Info" icon={<FaBriefcase />}>
            <ProfileField label="Join Date" icon={<FaCalendarAlt />} value={formatDate(formData.joinDate)} />
            <ProfileField label="Start Date" icon={<FaCalendarAlt />} value={formatDate(formData.jobStartDate)} />
            <ProfileField label="Weekly Hours" icon={<FaRegClock />} value={`${formData.weeklyHours} hrs`} />
            <ProfileField label="Hourly Rate" icon={<FaMoneyBillWave />} value={`£${formData.hourlyRate}`} />
            <ProfileField label="Annual Wages" icon={<FaMoneyBillWave />} value={`£${formData.annualWages}`} />
          </ProfileCard>

          <ProfileCard title="Documents" icon={<FaPassport />}>
            <ProfileField label="Passport No." icon={<FaPassport />} value={formData.passportNumber} />
            <ProfileField label="Expiry Date" icon={<FaCalendarAlt />} value={formatDate(formData.passportExpireDate)} />
          </ProfileCard>

          <ProfileCard title="Emergency Contact" icon={<FaPhone />}>
            {formData.emergencyContacts?.length > 0 ? (
              formData.emergencyContacts.map((c, i) => (
                <div key={i} className="mt-1 text-gray-600 text-sm space-y-1">
                  <p><strong>{c.fullName}</strong> ({c.relationship})</p>
                  <p>{c.contactNumber}</p>
                  <p>{c.email}</p>
                  <p>{c.address}, {c.townCity} {c.postcode}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm">No emergency contact added.</p>
            )}
          </ProfileCard>
        </div>
      </div>

      {/* === Edit Modal === */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl p-6 md:p-8 relative shadow-xl overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl"
            >
              <FaTimes />
            </button>
            <h2 className="text-2xl font-semibold mb-5 text-gray-800 flex items-center gap-2">
              <FaEdit className="text-primary" /> Edit Profile
            </h2>

            <form onSubmit={handleSave} className="space-y-5">
              {/* === Profile Image Upload (Top Section) === */}
              <div className="flex flex-col items-center mb-6">
                <label htmlFor="image" className="relative cursor-pointer group">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile Preview"
                      className="w-32 h-32 rounded-full object-cover border-4 border-primary/40 shadow-lg group-hover:opacity-80 transition"
                    />
                  ) : (
                    <div className="w-32 h-32 flex items-center justify-center rounded-full border-2 border-dashed border-gray-300 bg-gray-50 group-hover:bg-gray-100 transition">
                      <FaUserCircle className="text-gray-400 text-7xl group-hover:text-primary transition" />
                    </div>
                  )}
                  <input
                    id="image"
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleChange}
                    className="hidden"
                  />
                  <div className="absolute bottom-1 right-1 bg-primary text-white text-xs px-2 py-0.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition">
                    Change
                  </div>
                </label>
                <p className="text-sm text-gray-500 mt-2">Click avatar to upload</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  "fullName", "jobTitle", "phoneNumber", "address",
                  "niNumber", "offDay", "weeklyHours", "hourlyRate",
                  "annualWages", "passportNumber"
                ].map((field) => (
                  <div key={field}>
                    <label className="block mb-1 text-sm font-medium text-gray-700 capitalize">
                      {field.replace(/([A-Z])/g, " $1")}
                    </label>
                    <input
                      type="text"
                      name={field}
                      value={formData[field] || ""}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary/40 outline-none"
                    />
                  </div>
                ))}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Job Start Date</label>
                  <input
                    type="date"
                    name="jobStartDate"
                    value={formData.jobStartDate?.slice(0, 10) || ""}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Passport Expiry Date</label>
                  <input
                    type="date"
                    name="passportExpireDate"
                    value={formData.passportExpireDate?.slice(0, 10) || ""}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-md px-3 py-2"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className={`px-6 py-2.5 rounded-md text-white bg-primary hover:bg-primary/90 transition ${
                    saving ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* === Sub Components === */
const ProfileCard = ({ title, icon, children }) => (
  <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 hover:shadow-md transition">
    <h3 className="flex items-center gap-2 font-semibold text-gray-700 mb-3">
      <span className="text-primary">{icon}</span> {title}
    </h3>
    {children}
  </div>
);

const ProfileField = ({ icon, label, value }) => (
  <p className="flex items-center gap-2 text-gray-600 text-sm mb-2">
    <span className="text-secondary">{icon}</span>
    <strong className="min-w-[110px] text-gray-700">{label}:</strong>
    <span>{value || "—"}</span>
  </p>
);

export default Profile;

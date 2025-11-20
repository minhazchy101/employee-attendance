import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useAppContext } from "../../context/AppContext";
import { usePolish } from "../../hooks/usePolish";
import PageHeader from "../../components/reusable/PageHeader";
import LoadingSpinner from "../../components/reusable/LoadingSpinner";
import { useLocation } from "react-router-dom";

// Reusable input field
const InputField = ({ label, name, value, onChange, type = "text" }) => (
  <div>
    <label className="block mb-1 font-medium text-gray-600">{label}</label>
    <input
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      required
      className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
    />
  </div>
);

const defaultContact = {
  fullName: "",
  relationship: "",
  address: "",
  townCity: "",
  postcode: "",
  contactNumber: "",
  email: "",
};

const defaultDocument = { file: null, name: "" };

const defaultForm = {
  phoneNumber: "",
  niNumber: "",
  jobTitle: "",
  sponsorshipLicenseNumber: "",
  sponsorDocuments: [defaultDocument],
  address: "",
  passportNumber: "",
  passportExpireDate: "",
  jobStartDate: "",
  weeklyHours: 40,
  hourlyRate: 1,
  annualWages: 1,
  emergencyContacts: [defaultContact],
};

const CompleteProfile = () => {
  const { token, profile, fetchUserProfile, navigate } = useAppContext();
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const location = useLocation();

  useEffect(() => {
    if (!loading && profile?.isProfileComplete && location.pathname === "/dashboard/complete-profile") {
      navigate("/dashboard");
    }
  }, [loading, profile, navigate, location.pathname]);

  const fetchProfile = async () => {
    if (!profile?._id) {
      setIsFetching(false);
      setLoading(true);
      return;
    }

    try {
      setForm({
        ...defaultForm,
        ...profile,
        emergencyContacts: profile?.emergencyContacts?.length > 0 ? profile.emergencyContacts : [defaultContact],
        sponsorDocuments: profile?.sponsorDocuments?.length > 0
          ? profile.sponsorDocuments.map((fileName) => ({ file: null, name: fileName }))
          : [defaultDocument],
      });
    } catch (err) {
      console.error("Profile fetch failed:", err);
      Swal.fire({
        icon: "error",
        title: "Failed to fetch profile",
        text: err?.response?.data?.message || err.message,
      });
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (token && profile) fetchProfile();
    else setIsFetching(false);
  }, [token, profile]);

  usePolish({
    "user-change": (data) => {
      if (data.userId === profile?._id) fetchProfile();
    },
  });

  // Handle general input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Emergency contacts handlers
  const handleContactChange = (index, e) => {
    const { name, value } = e.target;
    const updatedContacts = [...form.emergencyContacts];
    updatedContacts[index][name] = value;
    setForm((prev) => ({ ...prev, emergencyContacts: updatedContacts }));
  };

  const addContact = () => {
    setForm((prev) => ({
      ...prev,
      emergencyContacts: [...prev.emergencyContacts, defaultContact],
    }));
  };

  const removeContact = (index) => {
    Swal.fire({
      title: "Remove this contact?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonText: "Cancel",
      confirmButtonText: "Yes, remove",
    }).then((result) => {
      if (result.isConfirmed) {
        setForm((prev) => ({
          ...prev,
          emergencyContacts: prev.emergencyContacts.filter((_, i) => i !== index),
        }));
      }
    });
  };

  // Document handlers
  const handleDocumentChange = (index, e) => {
    const file = e.target.files[0];
    const updatedDocs = [...form.sponsorDocuments];
    updatedDocs[index] = { file, name: file?.name || "" };
    setForm((prev) => ({ ...prev, sponsorDocuments: updatedDocs }));
  };

  const addDocument = () => {
    setForm((prev) => ({
      ...prev,
      sponsorDocuments: [...prev.sponsorDocuments, defaultDocument],
    }));
  };

  const removeDocument = (index) => {
    Swal.fire({
      title: "Remove this document?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonText: "Cancel",
      confirmButtonText: "Yes, remove",
    }).then((result) => {
      if (result.isConfirmed) {
        setForm((prev) => ({
          ...prev,
          sponsorDocuments: prev.sponsorDocuments.filter((_, i) => i !== index),
        }));
      }
    });
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      for (let key in form) {
        if (key === "emergencyContacts") {
          formData.append(key, JSON.stringify(form[key]));
        } else if (key === "sponsorDocuments") {
          form[key].forEach((doc) => {
            if (doc.file) formData.append("sponsorDocuments", doc.file);
          });
        } else {
          formData.append(key, form[key]);
        }
      }

      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/users/update-profile/${profile._id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
      );

      Swal.fire({
        icon: "success",
        title: "Profile Updated Successfully!",
        timer: 1200,
        showConfirmButton: false,
      });

      await fetchUserProfile(profile.email);
      navigate("/dashboard/profile");
    } catch (err) {
      console.error("Update failed:", err);
      Swal.fire({
        icon: "error",
        title: "Failed to update profile",
        text: err?.response?.data?.message || err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 space-y-6">
      <PageHeader
        title="Complete Your Profile"
        subtitle="Please fill out all required fields before accessing the dashboard."
      />

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information */}
        <div className="bg-white shadow-md rounded-lg p-6 space-y-6 border border-primary/20">
          <h2 className="text-xl font-semibold text-primary">Personal Information</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <InputField label="Phone Number" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} type="tel" />
            <InputField label="NI Number" name="niNumber" value={form.niNumber} onChange={handleChange} />
            <InputField label="Job Title" name="jobTitle" value={form.jobTitle} onChange={handleChange} />
            <InputField label="Address" name="address" value={form.address} onChange={handleChange} />
            <InputField label="Passport Number" name="passportNumber" value={form.passportNumber} onChange={handleChange} />
            <InputField label="Passport Expire Date" name="passportExpireDate" value={form.passportExpireDate} onChange={handleChange} type="date" />
            <InputField label="Job Start Date" name="jobStartDate" value={form.jobStartDate} onChange={handleChange} type="date" />
            <InputField label="Weekly Hours" name="weeklyHours" value={form.weeklyHours} onChange={handleChange} type="number" />
            <InputField label="Hourly Rate (£)" name="hourlyRate" value={form.hourlyRate} onChange={handleChange} type="number" />
            <InputField label="Annual Wages (£)" name="annualWages" value={form.annualWages} onChange={handleChange} type="number" />

            <div>
              <label className="block mb-1 font-medium text-gray-600">Sponsorship License Number (Optional)</label>
              <input
                name="sponsorshipLicenseNumber"
                value={form.sponsorshipLicenseNumber}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
              />
            </div>

            {/* Documents Section */}
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <label className="block font-medium text-gray-600">Documents (Optional)</label>
                <button
                  type="button"
                  onClick={addDocument}
                  className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition text-sm"
                >
                  + Add Document
                </button>
              </div>

              {form.sponsorDocuments.map((doc, index) => (
                <div key={index} className="flex items-center space-x-3 mb-2">
                  <input
                    type="file"
                    onChange={(e) => handleDocumentChange(index, e)}
                    className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition w-full"
                  />
                  {form.sponsorDocuments.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDocument(index)}
                      className="text-red-500 font-medium hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="bg-white shadow-md rounded-lg p-6 space-y-4 border border-secondary/20">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-secondary">Emergency Contacts</h2>
            <button
              type="button"
              onClick={addContact}
              className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition"
            >
              + Add Contact
            </button>
          </div>

          {form.emergencyContacts.map((contact, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50 relative">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-gray-700">Contact {index + 1}</h3>
                {form.emergencyContacts.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeContact(index)}
                    className="text-red-500 text-sm hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <InputField label="Full Name" name="fullName" value={contact.fullName} onChange={(e) => handleContactChange(index, e)} />
                <InputField label="Relationship" name="relationship" value={contact.relationship} onChange={(e) => handleContactChange(index, e)} />
                <InputField label="Address" name="address" value={contact.address} onChange={(e) => handleContactChange(index, e)} />
                <InputField label="Town / City" name="townCity" value={contact.townCity} onChange={(e) => handleContactChange(index, e)} />
                <InputField label="Postcode" name="postcode" value={contact.postcode} onChange={(e) => handleContactChange(index, e)} />
                <InputField label="Contact Number" name="contactNumber" value={contact.contactNumber} onChange={(e) => handleContactChange(index, e)} type="tel" />
                <InputField label="Email" name="email" value={contact.email} onChange={(e) => handleContactChange(index, e)} type="email" />
              </div>
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
        >
          {loading ? "Saving..." : "Save & Complete Profile"}
        </button>
      </form>
    </div>
  );
};

export default CompleteProfile;

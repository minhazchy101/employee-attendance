import React from "react";
import { FaTimes, FaPlus, FaTrash } from "react-icons/fa";

const EditModal = ({
  formData,
  imagePreview,
  setModalOpen,
  setImagePreview,
  handleChange,
  handleSave,
  saving,
  addEmergencyContact,
  removeEmergencyContact,
  addSponsorDocument,
  removeSponsorDocument
}) => {
  return (
    <div className="fixed inset-0 bg-white/80 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl p-6 relative overflow-y-auto max-h-[90vh]">
        <button
          onClick={() => setModalOpen(false)}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
        >
          <FaTimes size={20} />
        </button>

        <h2 className="text-2xl font-semibold mb-4">Edit Profile</h2>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Profile Image */}
          <div className="flex flex-col items-center">
            <img
              src={
                imagePreview ||
                formData.image ||
                `https://ui-avatars.com/api/?name=${formData.fullName}&background=70b698&color=fff`
              }
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover mb-2 border"
            />
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
            />
          </div>

          {/* Personal Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} />
            <InputField label="Email" name="email" value={formData.email} onChange={handleChange} />
            <InputField label="Phone" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} />
            <InputField label="Address" name="address" value={formData.address} onChange={handleChange} />
            <InputField label="Job Title" name="jobTitle" value={formData.jobTitle} onChange={handleChange} />
            <InputField label="NI Number" name="niNumber" value={formData.niNumber} onChange={handleChange} />
            <InputField label="Off Day" name="offDay" value={formData.offDay} onChange={handleChange} />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Join Date" type="date" name="joinDate" value={formData.joinDate} onChange={handleChange} />
            <InputField label="Job Start Date" type="date" name="jobStartDate" value={formData.jobStartDate} onChange={handleChange} />
            <InputField label="Passport Expiry" type="date" name="passportExpireDate" value={formData.passportExpireDate} onChange={handleChange} />
          </div>

          {/* Emergency Contacts */}
          <div>
            <h3 className="font-semibold mb-2">Emergency Contacts</h3>
            {formData.emergencyContacts?.map((c, i) => (
              <div key={i} className="border p-3 rounded mb-2 relative">
                <button
                  type="button"
                  onClick={() => removeEmergencyContact(i)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                >
                  <FaTrash />
                </button>
                <InputField label="Full Name" name="emergencyContacts" typeIndex={i} typeName="fullName" value={c.fullName} onChange={handleChange} />
                <InputField label="Relationship" name="emergencyContacts" typeIndex={i} typeName="relationship" value={c.relationship} onChange={handleChange} />
                <InputField label="Contact Number" name="emergencyContacts" typeIndex={i} typeName="contactNumber" value={c.contactNumber} onChange={handleChange} />
                <InputField label="Email" name="emergencyContacts" typeIndex={i} typeName="email" value={c.email} onChange={handleChange} />
                <InputField label="Address" name="emergencyContacts" typeIndex={i} typeName="address" value={c.address} onChange={handleChange} />
                <InputField label="Town/City" name="emergencyContacts" typeIndex={i} typeName="townCity" value={c.townCity} onChange={handleChange} />
                <InputField label="Postcode" name="emergencyContacts" typeIndex={i} typeName="postcode" value={c.postcode} onChange={handleChange} />
              </div>
            ))}
            <button
              type="button"
              onClick={addEmergencyContact}
              className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
            >
              <FaPlus /> Add Contact
            </button>
          </div>

          {/* Sponsor Documents */}
          <div>
            <h3 className="font-semibold mb-2">Sponsor Documents</h3>
            {formData.sponsorDocuments?.map((doc, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <input type="file" name="sponsorDocuments" onChange={(e) => handleChange(e, i)} />
                <button type="button" onClick={() => removeSponsorDocument(i)} className="text-red-500 hover:text-red-700">
                  <FaTrash />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addSponsorDocument}
              className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
            >
              <FaPlus /> Add Document
            </button>
          </div>

          <button
            type="submit"
            disabled={saving}
            className={`w-full py-2 px-4 mt-4 rounded text-white font-medium bg-primary hover:bg-primary/90 transition ${
              saving ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

const InputField = ({ label, name, value, onChange, type = "text", typeIndex = null, typeName = null }) => (
  <div className="flex flex-col">
    <label className="text-gray-600 text-sm mb-1">{label}</label>
    <input
      type={type}
      name={name}
      value={value || ""}
      onChange={(e) => onChange(e, typeIndex, typeName)}
      className="border rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
    />
  </div>
);

export default EditModal;

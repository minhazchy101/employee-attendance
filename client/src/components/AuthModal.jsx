import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import Swal from "sweetalert2";
import { FiUser } from "react-icons/fi";  // react-icons user icon
import { auth } from "../firebase/firebase.config";
import { useAppContext } from "../context/AppContext";
import axios from "axios";

const LOGIN = "login";
const SIGNUP = "signup";

const AuthModal = () => {
  const { setShowLogin, fetchUserProfile, navigate } = useAppContext();
  const [mode, setMode] = useState(LOGIN);
  const [fade, setFade] = useState(true);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const toggleMode = () => setFade(false);

  useEffect(() => {
    if (!fade) {
      const timeout = setTimeout(() => {
        setMode(prev => (prev === LOGIN ? SIGNUP : LOGIN));
        reset();
        setFileName("");
        setImagePreview(null);
        setFade(true);
      }, 150);
      return () => clearTimeout(timeout);
    }
  }, [fade, reset]);

  const onFileChange = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      setFileName(file.name);

      // Create image preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    } else {
      setFileName("");
      setImagePreview(null);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (mode === SIGNUP) {
        const formData = new FormData();
        formData.append("fullName", data.fullName);
        formData.append("email", data.email);
        formData.append("password", data.password);
        formData.append("phoneNumber", data.phoneNumber);
        formData.append("niNumber", data.niNumber);
        formData.append("jobTitle", data.jobTitle);
        formData.append("image", data.image[0]);

        // Firebase signup
        const result = await createUserWithEmailAndPassword(auth, data.email, data.password);
        await updateProfile(result.user, { displayName: data.fullName });

        // Backend signup
        await axios.post(`${import.meta.env.VITE_API_URL}/api/users/register`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        setTimeout(() => fetchUserProfile(data.email), 500);

        Swal.fire({
          icon: "success",
          title: "Account created successfully!",
          timer: 1500,
          showConfirmButton: false,
          background: "#f3f4f6", // secondary color background
          color: "#4f46e5", // primary color text
        });

        setShowLogin(false);
        navigate("/dashboard");
      } else {
        await signInWithEmailAndPassword(auth, data.email, data.password);
        await fetchUserProfile(data.email);

        Swal.fire({
          icon: "success",
          title: "Logged in successfully!",
          timer: 1200,
          showConfirmButton: false,
          background: "#f3f4f6",
          color: "#4f46e5",
        });

        setShowLogin(false);
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Auth error:", error);
      Swal.fire({
        icon: "error",
        title: "Authentication failed",
        text: error?.response?.data?.message || error.message,
        background: "#fef3c7", // light warning color
        color: "#b91c1c", // error text color
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={() => setShowLogin(false)}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 "
      aria-modal="true"
      role="dialog"
      aria-labelledby="auth-modal-title"
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit(onSubmit)}
        className="sm:w-[400px] w-full mx-4 p-10 bg-white rounded-2xl shadow-lg border border-gray-200 text-center"
        noValidate
      >
        <h1
          id="auth-modal-title"
          className="text-3xl font-bold text-primary mb-2"
        >
          {mode === LOGIN ? "Login" : "Sign Up"}
        </h1>
        <p className="text-gray-500 mb-6 text-sm">
          {mode === LOGIN ? "Please sign in to continue" : "Create an account to get started"}
        </p>

        <div className={`transition-opacity duration-200 ${fade ? "opacity-100" : "opacity-0"}`}>
          {mode === SIGNUP && (
            <>
              {/* Profile Image */}
              <label className="block text-left mb-1 text-gray-600 font-medium">
                Profile Image
              </label>
              <div className="mb-4">
                <label
                  htmlFor="image"
                  className="cursor-pointer rounded-full border-2 border-gray-300 hover:border-primary transition-colors duration-300 w-28 h-28 flex items-center justify-center bg-gray-50 overflow-hidden mx-auto relative"
                  title="Select profile image"
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile Preview"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <FiUser className="text-gray-400 text-6xl" />
                  )}
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    {...register("image", { required: "Profile image is required." })}
                    onChange={onFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </label>
                {fileName && (
                  <p className="text-center text-xs text-gray-500 truncate mt-1">{fileName}</p>
                )}
              </div>

              {/* Full Name */}
              <input
                type="text"
                placeholder="Full Name"
                {...register("fullName", { required: "Full name is required." })}
                className={`mb-4 w-full rounded-md border px-4 py-2 ${errors.fullName ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.fullName && <p className="text-red-500 text-xs mb-2">{errors.fullName.message}</p>}

              {/* Phone */}
              <input
                type="tel"
                placeholder="Phone Number"
                {...register("phoneNumber", {
                  required: "Valid phone number required.",
                  pattern: { value: /^[0-9+\-\s()]{7,15}$/, message: "Invalid phone number format." },
                })}
                className={`mb-4 w-full rounded-md border px-4 py-2 ${errors.phoneNumber ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.phoneNumber && <p className="text-red-500 text-xs mb-2">{errors.phoneNumber.message}</p>}

              {/* NI Number */}
              <input
                type="text"
                placeholder="NI Number"
                {...register("niNumber", {
                  required: "Valid NI number required.",
                  pattern: { value: /^[A-CEGHJ-PR-TW-Z]{2}\d{6}[A-D]$/i, message: "Invalid NI number format." },
                })}
                className={`mb-4 w-full rounded-md border px-4 py-2 uppercase ${errors.niNumber ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.niNumber && <p className="text-red-500 text-xs mb-2">{errors.niNumber.message}</p>}

              {/* Job */}
              <input
                type="text"
                placeholder="Job Title"
                {...register("jobTitle", { required: "Job title is required." })}
                className={`mb-4 w-full rounded-md border px-4 py-2 ${errors.jobTitle ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.jobTitle && <p className="text-red-500 text-xs mb-2">{errors.jobTitle.message}</p>}
            </>
          )}

          {/* Email */}
          <input
            type="email"
            placeholder="Email"
            {...register("email", { required: "Email is required." })}
            className={`mb-4 w-full rounded-md border px-4 py-2 ${errors.email ? "border-red-500" : "border-gray-300"}`}
          />
          {errors.email && <p className="text-red-500 text-xs mb-2">{errors.email.message}</p>}

          {/* Password */}
          <input
            type="password"
            placeholder="Password"
            {...register("password", {
              required: "Password must be at least 6 characters.",
              minLength: { value: 6, message: "Minimum 6 characters required." },
            })}
            className={`mb-4 w-full rounded-md border px-4 py-2 ${errors.password ? "border-red-500" : "border-gray-300"}`}
          />
          {errors.password && <p className="text-red-500 text-xs mb-2">{errors.password.message}</p>}
        </div>

        {mode === LOGIN && (
          <div className="mt-2 text-left text-primary">
            <button type="button" className="text-sm hover:underline">Forgot password?</button>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`mt-4 w-full h-11 rounded-full text-white bg-primary hover:opacity-90 transition-opacity duration-200 ${loading ? "cursor-not-allowed opacity-70" : ""}`}
        >
          {loading ? "Please wait..." : mode === LOGIN ? "Login" : "Create Account"}
        </button>

        <p className="text-gray-500 text-sm mt-5 mb-8">
          {mode === LOGIN ? "Don't have an account?" : "Already have an account?"}{" "}
          <button type="button" onClick={toggleMode} className="text-primary hover:underline">
            Click here
          </button>
        </p>
      </form>
    </div>
  );
};

export default AuthModal;

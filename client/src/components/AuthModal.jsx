import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "../firebase/firebase.config";
import { useAppContext } from "../context/AppContext";
import axios from "axios";

const LOGIN = "login";
const SIGNUP = "signup";

const AuthModal = () => {
  const { setShowLogin, profile, navigate } = useAppContext();
  const [mode, setMode] = useState(LOGIN);
  const [fade, setFade] = useState(true);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  console.log('profile : ' , profile)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const toggleMode = () => setFade(false);

  useEffect(() => {
    if (!fade) {
      const timeout = setTimeout(() => {
        setMode((prev) => (prev === LOGIN ? SIGNUP : LOGIN));
        reset();
        setFileName("");
        setFade(true);
      }, 150);
      return () => clearTimeout(timeout);
    }
  }, [fade, reset]);

  const onFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
    } else {
      setFileName("");
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (mode === SIGNUP) {
        // Ensure image is selected
        if (!data.image?.[0]) {
          alert("Profile image is required.");
          setLoading(false);
          return;
        }

        const formData = new FormData();
        formData.append("fullName", data.fullName);
        formData.append("email", data.email);
        formData.append("password", data.password);
        formData.append("phoneNumber", data.phoneNumber);
        formData.append("niNumber", data.niNumber);
        formData.append("jobTitle", data.jobTitle);
        formData.append("image", data.image[0]);

        // 1️⃣ Create Firebase user
        const result = await createUserWithEmailAndPassword(
          auth,
          data.email,
          data.password
        );

        await updateProfile(result.user, {
          displayName: data.fullName,
          photoURL : profile?.image
        });

        // 2️⃣ Send data to backend (with image file)
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/users/register`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        alert("Account created successfully!");
        setShowLogin(false);
        navigate("/dashboard");
      } else {
        // LOGIN
        await signInWithEmailAndPassword(auth, data.email, data.password);
        alert("Logged in successfully!");
        setShowLogin(false);
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Auth error:", error);
      alert(error?.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={() => setShowLogin(false)}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      aria-modal="true"
      role="dialog"
      aria-labelledby="auth-modal-title"
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit(onSubmit)}
        className="sm:w-[380px] w-full mx-4 text-center border border-gray-300/60 rounded-2xl px-8 bg-white py-10"
        noValidate
      >
        <h1
          id="auth-modal-title"
          className="text-gray-900 text-3xl font-semibold mb-2"
        >
          {mode === LOGIN ? "Login" : "Sign Up"}
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          {mode === LOGIN
            ? "Please sign in to continue"
            : "Create an account to get started"}
        </p>

        <div className={`transition-opacity duration-200 ${fade ? "opacity-100" : "opacity-0"}`}>
          {mode === SIGNUP && (
            <>
              <label htmlFor="image" className="block text-left mb-1 text-gray-600 font-medium">
                Profile Image (required)
              </label>
              <div className="flex items-center mb-4 w-full border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  {...register("image")}
                  onChange={onFileChange}
                  className="border-none outline-none ring-0 w-full text-sm cursor-pointer"
                />
                {fileName && (
                  <span className="text-xs text-gray-500 truncate max-w-xs">
                    {fileName}
                  </span>
                )}
              </div>

              {/* Full Name */}
              <input
                type="text"
                placeholder="Full Name"
                {...register("fullName", { required: "Full name is required." })}
                className={`mb-4 w-full rounded-md border px-4 py-2 text-gray-900 ${errors.fullName ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.fullName && <p className="text-red-500 text-xs mb-2">{errors.fullName.message}</p>}

              {/* Phone Number */}
              <input
                type="tel"
                placeholder="Phone Number"
                {...register("phoneNumber", {
                  required: "Valid phone number required.",
                  pattern: { value: /^[0-9+\-\s()]{7,15}$/, message: "Invalid phone number format." },
                })}
                className={`mb-4 w-full rounded-md border px-4 py-2 text-gray-900 ${errors.phoneNumber ? "border-red-500" : "border-gray-300"}`}
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
                className={`mb-4 w-full rounded-md border px-4 py-2 text-gray-900 uppercase ${errors.niNumber ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.niNumber && <p className="text-red-500 text-xs mb-2">{errors.niNumber.message}</p>}

              {/* Job Title */}
              <input
                type="text"
                placeholder="Job Title"
                {...register("jobTitle", { required: "Job title is required." })}
                className={`mb-4 w-full rounded-md border px-4 py-2 text-gray-900 ${errors.jobTitle ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.jobTitle && <p className="text-red-500 text-xs mb-2">{errors.jobTitle.message}</p>}
            </>
          )}

          {/* Email */}
          <input
            type="email"
            placeholder="Email"
            {...register("email", { required: "Email is required." })}
            className={`mb-4 w-full rounded-md border px-4 py-2 text-gray-900 ${errors.email ? "border-red-500" : "border-gray-300"}`}
          />
          {errors.email && <p className="text-red-500 text-xs mb-2">{errors.email.message}</p>}

          {/* Password */}
          <input
            type="password"
            placeholder="Password"
            {...register("password", { required: "Password must be at least 6 characters.", minLength: { value: 6, message: "Minimum 6 characters required." } })}
            className={`mb-4 w-full rounded-md border px-4 py-2 text-gray-900 ${errors.password ? "border-red-500" : "border-gray-300"}`}
          />
          {errors.password && <p className="text-red-500 text-xs mb-2">{errors.password.message}</p>}
        </div>

        {mode === LOGIN && (
          <div className="mt-2 text-left text-indigo-500">
            <button type="button" className="text-sm hover:underline">Forgot password?</button>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`mt-4 w-full h-11 rounded-full text-white bg-indigo-500 hover:opacity-90 transition-opacity duration-200 ${loading ? "cursor-not-allowed opacity-70" : ""}`}
        >
          {loading ? "Please wait..." : mode === LOGIN ? "Login" : "Create Account"}
        </button>

        <p className="text-gray-500 text-sm mt-5 mb-8">
          {mode === LOGIN ? "Don't have an account?" : "Already have an account?"}{" "}
          <button type="button" onClick={toggleMode} className="text-indigo-500 hover:underline">
            Click here
          </button>
        </p>
      </form>
    </div>
  );
};

export default AuthModal;

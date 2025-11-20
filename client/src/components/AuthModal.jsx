import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import Swal from "sweetalert2";
import { FiUser } from "react-icons/fi";
import { auth } from "../firebase/firebase.config";
import { useAppContext } from "../context/AppContext";
import axios from "axios";

const LOGIN = "login";
const SIGNUP = "signup";

const PasswordStrengthIndicator = ({ strength }) => {
  const color =
    strength === "Too short" ? "text-red-500" :
    strength === "Weak" ? "text-orange-500" :
    strength === "Medium" ? "text-yellow-500" : "text-green-500";

  return strength ? (
    <p className={`text-xs font-medium ${color} mb-3`}>Password Strength: {strength}</p>
  ) : null;
};

const AuthModal = () => {
  const { setShowLogin, fetchUserProfile, navigate } = useAppContext();
  const [mode, setMode] = useState(LOGIN);
  const [fade, setFade] = useState(true);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState("");

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();
  const passwordValue = watch("password", "");

  useEffect(() => {
    if (!passwordValue) setPasswordStrength("");
    else if (passwordValue.length < 6) setPasswordStrength("Too short");
    else if (passwordValue.length < 8) setPasswordStrength("Weak");
    else if (passwordValue.length < 12) setPasswordStrength("Medium");
    else setPasswordStrength("Strong");
  }, [passwordValue]);

  const toggleMode = () => setFade(false);

  useEffect(() => {
    if (!fade) {
      const timeout = setTimeout(() => {
        setMode(prev => (prev === LOGIN ? SIGNUP : LOGIN));
        reset();
        setFileName("");
        setImagePreview(null);
        setPasswordStrength("");
        setFade(true);
      }, 150);
      return () => clearTimeout(timeout);
    }
  }, [fade, reset]);

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      setImagePreview(URL.createObjectURL(file));
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
        formData.append("image", data.image[0]);

        const result = await createUserWithEmailAndPassword(auth, data.email, data.password);
        await updateProfile(result.user, { displayName: data.fullName });

        const idToken = await result.user.getIdToken();
        localStorage.setItem("access-token", idToken);
        axios.defaults.headers.common["Authorization"] = `Bearer ${idToken}`;

        await axios.post(`${import.meta.env.VITE_API_URL}/api/users/register`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        await fetchUserProfile(data.email);
        Swal.fire({ icon: "success", title: "Registration Successful!", confirmButtonColor: "#4f46e5" });
        setShowLogin(false);
        navigate("/dashboard/complete-profile");
      } else {
        await signInWithEmailAndPassword(auth, data.email, data.password);
        const user = await fetchUserProfile(data.email);
        console.log('user : ', user)
        setShowLogin(false);
        navigate("/dashboard");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Authentication Failed",
        text: error?.response?.data?.message || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={() => setShowLogin(false)}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit(onSubmit)}
        className="sm:w-[400px] w-full p-10 bg-white rounded-2xl shadow-lg text-center"
      >
        <h1 className="text-3xl font-bold text-primary mb-2">{mode === LOGIN ? "Login" : "Sign Up"}</h1>
        <p className="text-gray-500 mb-6 text-sm">{mode === LOGIN ? "Please sign in to continue" : "Create an account"}</p>

        {mode === LOGIN ? (
          <>
            <input
              type="email"
              placeholder="Email"
              {...register("email", { required: "Email is required." })}
              className="mb-3 w-full rounded-md border border-gray-300 px-4 py-2"
            />
            {errors.email && <p className="text-red-500 text-xs mb-3">{errors.email.message}</p>}

            <input
              type="password"
              placeholder="Password"
              {...register("password", { required: "Password is required." })}
              className="mb-3 w-full rounded-md border border-gray-300 px-4 py-2"
            />
            {errors.password && <p className="text-red-500 text-xs mb-3">{errors.password.message}</p>}
          </>
        ) : (
          <>
            <label className="block text-left mb-1 text-gray-600 font-medium">Profile Image</label>
            <div className="mb-4">
              <label
                htmlFor="image"
                className="cursor-pointer rounded-full border-2 border-gray-300 hover:border-primary w-28 h-28 flex items-center justify-center bg-gray-50 overflow-hidden mx-auto relative"
              >
                {imagePreview ? <img src={imagePreview} alt="Profile" className="w-full h-full object-cover rounded-full" /> : <FiUser className="text-gray-400 text-6xl" />}
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  {...register("image", { required: "Profile image is required." })}
                  onChange={onFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </label>
              {fileName && <p className="text-center text-xs text-gray-500 mt-1 truncate">{fileName}</p>}
              {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image.message}</p>}
            </div>

            <input
              type="text"
              placeholder="Full Name"
              {...register("fullName", { required: "Full name is required." })}
              className="mb-3 w-full rounded-md border border-gray-300 px-4 py-2"
            />
            {errors.fullName && <p className="text-red-500 text-xs mb-3">{errors.fullName.message}</p>}

            <input
              type="email"
              placeholder="Email"
              {...register("email", { required: "Email is required." })}
              className="mb-3 w-full rounded-md border border-gray-300 px-4 py-2"
            />
            {errors.email && <p className="text-red-500 text-xs mb-3">{errors.email.message}</p>}

            <input
              type="password"
              placeholder="Password"
              {...register("password", { required: "Password is required." })}
              className="mb-1 w-full rounded-md border border-gray-300 px-4 py-2"
            />
            <PasswordStrengthIndicator strength={passwordStrength} />
            {errors.password && <p className="text-red-500 text-xs mb-3">{errors.password.message}</p>}

            <input
              type="password"
              placeholder="Confirm Password"
              {...register("confirmPassword", {
                required: "Confirm password is required.",
                validate: (value) => value === passwordValue || "Passwords do not match.",
              })}
              className="mb-3 w-full rounded-md border border-gray-300 px-4 py-2"
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs mb-3">{errors.confirmPassword.message}</p>}
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`mt-4 w-full h-11 rounded-full text-white bg-primary hover:opacity-90 ${loading ? "cursor-not-allowed opacity-70" : ""}`}
        >
          {loading ? "Please wait..." : mode === LOGIN ? "Login" : "Create Account"}
        </button>

        <p className="text-gray-500 text-sm mt-5 mb-0">
          {mode === LOGIN ? "Don't have an account?" : "Already have an account?"}{" "}
          <button type="button" onClick={toggleMode} className="text-primary hover:underline">Click here</button>
        </p>
      </form>
    </div>
  );
};

export default AuthModal;

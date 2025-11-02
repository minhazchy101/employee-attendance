import React from "react";
import { useAppContext } from "../context/AppContext";
import Attendance from "./Attendance";

const Hero = () => {
  const { setShowLogin, profile, loading, logout, navigate, user } = useAppContext();

  const handleGetStarted = () => {
    if (loading) return;
    if (profile) {
      navigate("/dashboard");
    } else {
      setShowLogin(true);
    }
  };

  return (
    <section className="my-24 text-center font-[nautilus_pompiliusregular]">
      {/* --- Headline --- */}
      <h1 className="text-4xl md:text-6xl font-semibold max-w-2xl mx-auto text-black leading-tight">
        Smarter Attendance.  
        <span className="text-primary"> Simplified Workflows.</span>
      </h1>

      {/* --- Subheadline --- */}
      <p className="text-base md:text-lg text-secondary mx-auto max-w-xl mt-6 px-6 leading-relaxed">
        Streamline employee tracking with real-time insights and automated records —  
        so you can focus on people, not paperwork.
      </p>

      {/* --- Buttons --- */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={handleGetStarted}
          className="bg-primary hover:opacity-90 text-white px-8 py-3 rounded-full font-medium transition-all duration-300 cursor-pointer"
        >
          Get Started
        </button>

        {user && (
          <button
            onClick={logout}
            className="bg-black hover:opacity-90 text-white px-8 py-3 rounded-full font-medium transition-all duration-300 cursor-pointer"
          >
            Log Out
          </button>
        )}
      </div>

      {/* --- Demo / Preview Section --- */}
      <div className="mt-16">
        <Attendance />
      </div>
    </section>
  );
};

export default Hero;

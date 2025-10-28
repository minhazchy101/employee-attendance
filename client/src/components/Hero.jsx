import React from "react";
import { useAppContext } from "../context/AppContext";
import Attendance from "./Attendance";


const Hero = () => {
  const { setShowLogin, profile, loading,logout, navigate } = useAppContext();
 

  const handleGetStarted = () => {
    if (loading) return; // wait until context finishes loading
    if (profile) {
      navigate("/dashboard"); // go to dashboard if profile exists
    } else {
      setShowLogin(true); // open login/signup modal
    }
  };

  return (
    <div className="my-20 text-center">
      <h1 className="text-4xl md:text-6xl font-semibold max-w-3xl mx-auto mt-8 text-slate-900 leading-tight">
        Smart Employee Attendance Tracking Made Simple
      </h1>

      <p className="text-base md:text-lg text-slate-600 mx-auto max-w-2xl mt-4 px-4">
        Automate daily check-ins, monitor employee presence in real-time, and
        eliminate manual errors — all from a single, intuitive dashboard.
      </p>

      <div className="mt-6 flex items-center justify-center">
        <button
          onClick={handleGetStarted}
          className="bg-primary hover:bg-primary-dull text-white px-6 py-3 rounded-full font-medium transition cursor-pointer"
        >
          Get Started
        </button>
      
      {profile &&
      
      <button onClick={()=>logout()}  className="bg-primary hover:bg-primary-dull text-white px-6 py-3 rounded-full font-medium transition cursor-pointer">LogOut</button>
      }
      </div>

      <Attendance/>
    </div>
  );
};

export default Hero;

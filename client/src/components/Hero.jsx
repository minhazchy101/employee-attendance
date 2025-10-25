import React from "react";
import { useAppContext } from "../context/AppContext";


const Hero = () => {
  const {setShowLogin} = useAppContext()
  return (
    <div className="my-20">
      <h1 className="text-4xl md:text-6xl font-semibold max-w-3xl text-center mx-auto mt-8 text-slate-900 leading-tight">
        Smart Employee Attendance Tracking Made Simple
      </h1>

      <p className="text-base md:text-lg text-slate-600 mx-auto max-w-2xl text-center mt-4 px-4">
        Automate daily check-ins, monitor employee presence in real-time, and
        eliminate manual errors — all from a single, intuitive dashboard.
      </p>

      <div className="mx-auto w-full flex items-center justify-center gap-3 mt-6">
        <button  onClick={()=> setShowLogin(true)}  className="bg-primary hover:bg-primary-dull text-white px-6 py-3 rounded-full font-medium transition cursor-pointer">
          Get Started
        </button>
      </div>
    </div>
  );
};

export default Hero;

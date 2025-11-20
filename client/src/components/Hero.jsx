import React from "react";
import { useAppContext } from "../context/AppContext";
// import Attendance from "./Attendance";

const Hero = () => {
  const { setShowLogin, loading, logout, navigate, user } = useAppContext();

  const handleGetStarted = () => {
    if (loading) return;
    if (user) {
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
      {/* <div className="mt-16">
        <Attendance />
      </div> */}


      
    </section>
  );
};

export default Hero;


// import React from 'react'

// const Hero = () => {
 
//     return (
//         <>
//             <style>{`
//                 @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
            
//                 * {
//                     font-family: 'Poppins', sans-serif;
//                 }
//             `}</style>
//             <section className="flex flex-col items-center justify-center mx-auto max-md:mx-2 max-md:px-2 max-w-5xl w-full text-center rounded-2xl py-20 md:py-24 bg-[url('https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/banners/image-1.png')] bg-cover bg-center bg-no-repeat">
//                 <h1 className="text-2xl md:text-3xl font-medium text-white max-w-2xl">Empower Your Sales & Marketing with a Next-Gen AI Workforce</h1>
//                 <div className="h-[3px] w-32 my-1 bg-gradient-to-l from-transparent to-indigo-600"></div>
//                 <p className="text-sm md:text-base text-white max-w-xl">
//                     Leverage AI Agents for real-time calling and unified multi-channel engagement, optimizing customer interactions at scale.
//                 </p>
//                 <button className="px-8 py-2.5 mt-4 text-sm bg-gradient-to-r from-indigo-600 to-violet-500 hover:scale-105 transition duration-300 text-white rounded-full">
//                     Get Started
//                 </button>
//             </section>
//         </>
//     );
// };


// export default Hero
import React from "react";

const StatsCard = ({ label, value, icon: Icon, color = "indigo" }) => {
  const colorClasses = {
    indigo: "bg-indigo-100 text-indigo-600",
    green: "bg-green-100 text-green-600",
    yellow: "bg-yellow-100 text-yellow-600",
    red: "bg-red-100 text-red-600",
    blue: "bg-blue-100 text-blue-600",
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md border border-gray-100 transition transform hover:-translate-y-1 text-center">
      <div
        className={`${
          colorClasses[color] || colorClasses.indigo
        } w-14 h-14 flex items-center justify-center rounded-full mx-auto mb-3`}
      >
        {Icon && <Icon size={24} />}
      </div>
      <h2 className="text-3xl font-bold text-gray-800">{value}</h2>
      <p className="text-gray-500 mt-1 font-medium">{label}</p>
    </div>
  );
};

export default StatsCard;

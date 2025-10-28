import React from "react";

const PageHeader = ({ title, subtitle }) => {
  return (
    <div className="mb-6">
      <h1 className="text-2xl md:text-3xl font-semibold text-indigo-600">
        {title}
      </h1>
      {subtitle && (
        <p className="text-gray-500 mt-1 text-sm md:text-base">{subtitle}</p>
      )}
      <div className="h-0.5 bg-indigo-100 mt-3 w-20"></div>
    </div>
  );
};

export default PageHeader;

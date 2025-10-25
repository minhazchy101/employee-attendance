import React from "react";

const Title = ({ title, subtitle }) => {
  return (
    <div className="text-center mb-6">
      <h1 className="text-3xl font-semibold text-primary">{title}</h1>
      {subtitle && (
        <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default Title;

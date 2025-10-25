import React from "react";

const Title = ({ text }) => {
  return (
    <h1 className="text-3xl font-semibold text-primary text-center mb-4">
      {text}
    </h1>
  );
};

export default Title;

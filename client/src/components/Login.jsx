import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

const LOGIN = "login";
const SIGNUP = "signup";

const Login = () => {
  const { setShowLogin } = useAppContext();
  const [mode, setMode] = useState(LOGIN);
  const [fade, setFade] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // your login/signup logic here
  };

  // Smooth fade when toggling mode
  const toggleMode = () => {
    setFade(false); // start fade out
  };

  // When fade becomes false, wait and switch mode then fade in
  useEffect(() => {
    if (!fade) {
      const timeout = setTimeout(() => {
        setMode(prev => (prev === LOGIN ? SIGNUP : LOGIN));
        setFade(true); // fade in new form
      }, 100); // fade out duration
      return () => clearTimeout(timeout);
    }
  }, [fade]);

  return (
    <div
      onClick={() => setShowLogin(false)}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <form
        onClick={e => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="sm:w-[350px] w-full mx-4 text-center border border-gray-300/60 rounded-2xl px-8 bg-white py-10"
      >
        <h1 className="text-gray-900 text-3xl font-semibold mb-2">
          {mode === LOGIN ? "Login" : "Sign Up"}
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          {mode === LOGIN ? "Please sign in to continue" : "Create an account to get started"}
        </p>

        {/* Container with fade transition */}
        <div
          className={`transition-opacity duration-200 ${fade ? 'opacity-100' : 'opacity-0'}`}
        >
          {mode === SIGNUP && (
            <div className="flex items-center mb-4 w-full border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#6B7280"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="8" r="5" />
                <path d="M20 21a8 8 0 0 0-16 0" />
              </svg>
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
                className="border-none outline-none ring-0 w-full"
                required
              />
            </div>
          )}

          <div className="flex items-center mb-4 w-full border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#6B7280"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />
              <rect x="2" y="4" width="20" height="16" rx="2" />
            </svg>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="border-none outline-none ring-0 w-full"
              required
            />
          </div>

          <div className="flex items-center mb-4 w-full border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#6B7280"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="border-none outline-none ring-0 w-full"
              required
            />
          </div>
        </div>

        {mode === LOGIN && (
          <div className="mt-2 text-left text-indigo-500">
            <button type="button" className="text-sm hover:underline">
              Forgot password?
            </button>
          </div>
        )}

        <button
          type="submit"
          className="mt-4 w-full h-11 rounded-full text-white bg-indigo-500 hover:opacity-90 transition-opacity duration-200"
        >
          {mode === LOGIN ? "Login" : "Create Account"}
        </button>

        <p className="text-gray-500 text-sm mt-5 mb-8">
          {mode === LOGIN ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={toggleMode}
            className="text-indigo-500 hover:underline"
          >
            Click here
          </button>
        </p>
      </form>
    </div>
  );
};

export default Login;

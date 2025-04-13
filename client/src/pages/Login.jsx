// src/pages/Login.jsx
import React, { useState, useEffect, useRef } from "react";
import API from "../api/axios";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";

function Login() {
  const navigate = useNavigate();
  const emailRef = useRef(null); // ✅ Ref for auto-focus
  const [loading, setLoading] = useState(false);
  const [formAnimated, setFormAnimated] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({}); // ✅ Inline error state

  useEffect(() => {
    setTimeout(() => {
      setFormAnimated(true);
    }, 100);
    if (emailRef.current) emailRef.current.focus(); // ✅ Auto-focus email
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // Clear errors on input
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await API.post("/auth/login", formData);
      localStorage.setItem("token", response.data.token);
      toast.success("Login successful 🎉");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid credentials");
      setFormAnimated(true);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen font-['Inter'] bg-[#f9f5f1]">
      <ToastContainer />

      {/* Left Side - Image and Tagline */}
      <div className="w-full md:w-1/2 bg-gradient-to-br from-black via-[#0f0f0f] to-black text-white flex flex-col justify-center items-center p-10 md:p-16 relative phone-bg">
        <div className="text-center max-w-md">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
            Who needs wires <br /> when your calls can flex?
          </h2>
          <p className="text-gray-300 text-sm md:text-base">
            Say goodbye to hardware—hello to smart, sleek, and seamless.
          </p>
        </div>
        <div className="mt-10">
          <img
            src="/assets/phone-image.png"
            alt="Smartphone"
            loading="lazy"
            className={`w-48 md:w-64 h-auto object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] ${
              formAnimated ? "animate-float" : ""
            }`}
          />
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-6 md:px-20 py-10 bg-[#f9f5f1]">
        {loading ? (
          <Loader />
        ) : (
          <div
            className={`max-w-md w-full mx-auto transition-opacity duration-700 ${
              formAnimated ? "opacity-100 animate-fade-in" : "opacity-0"
            }`}
          >
            {/* Brand Logo */}
            <div className="mb-8 flex items-center space-x-2">
              <img
                src="/assets/dialmate-logo.svg"
                alt="Dialmate"
                className="w-8 h-8"
              />
              <h1 className="text-3xl font-bold text-gray-800">dialmate</h1>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold mb-2 text-gray-900">Login</h2>
            <p className="text-gray-600 mb-8 text-sm">
              Access your account to manage everything efficiently.
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block mb-1 text-sm text-gray-700">
                  Email ID
                </label>
                <input
                  ref={emailRef} // ✅ Auto-focus here
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  } rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder-gray-400 shadow-sm transition focus:shadow-md`}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block mb-1 text-sm text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  } rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder-gray-400 shadow-sm transition focus:shadow-md`}
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2 rounded" />
                  Remember me
                </label>
                <span className="text-orange-500 hover:underline cursor-pointer">
                  Forgot password?
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 bg-gradient-to-r from-[#b56a36] to-[#e6a258] text-white font-semibold rounded-xl transition shadow-md hover:shadow-lg ${
                  loading ? "opacity-60 cursor-not-allowed" : "hover:opacity-90"
                } flex items-center justify-center`}
              >
                {loading && (
                  <svg
                    className="animate-spin mr-2 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    ></path>
                  </svg>
                )}
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;
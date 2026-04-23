import React, { useState, useContext, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const ResetPassword = () => {
  const { backendUrl } = useContext(AppContext);
  axios.defaults.withCredentials = true;

  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [isOtpSubmitted, setIsOtpSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const inputRefs = useRef([]);

  const handleInput = (e, index) => {
    if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && e.target.value === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text");
    const pasteArray = paste.slice(0, 6).split("");
    pasteArray.forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char;
      }
    });
    const lastFilledIndex = Math.min(pasteArray.length - 1, 5);
    if (lastFilledIndex < 5 && inputRefs.current[lastFilledIndex + 1]) {
      inputRefs.current[lastFilledIndex + 1].focus();
    }
  };

  // Send OTP to email
  const onSubmitEmail = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    
    setLoading(true);
    try {
      const { data } = await axios.post(
        backendUrl + "/api/auth/send-reset-otp",
        { email }
      );
      if (data.success) {
        toast.success(data.message);
        setIsEmailSent(true);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const onSubmitOtp = async (e) => {
    e.preventDefault();
    const otpString = inputRefs.current.map((e) => e.value).join('');
    
    if (otpString.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }
    
    setLoading(true);
    try {
      const { data } = await axios.post(
        backendUrl + "/api/auth/verify-reset-otp",
        { email, otp: otpString }
      );
      if (data.success) {
        toast.success(data.message || "OTP verified successfully");
        setOtp(otpString); // Store the OTP for the final password reset call
        setIsOtpSubmitted(true);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  // Reset Password
  const onSubmitNewPassword = async (e) => {
    e.preventDefault();
    
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    
    setLoading(true);
    try {
      const { data } = await axios.post(backendUrl + '/api/auth/reset-password', {
        email, 
        otp, 
        newPassword
      });
      
      if (data.success) {
        toast.success(data.message);
        navigate('/login');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 to-purple-400">
      <img
        onClick={() => navigate("/")}
        src={assets.logo}
        alt="Logo"
        className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
      />

      {/* Enter Email Form */}
      {!isEmailSent && (
        <form onSubmit={onSubmitEmail} className="bg-slate-900 rounded-lg shadow-lg p-8 w-96 text-sm">
          <h1 className="text-white text-2xl font-semibold text-center mb-4">
            Reset Password
          </h1>
          <p className="text-center mb-6 text-indigo-300">
            Enter Your Registered Email Address.
          </p>
          <div className="w-full mb-4 flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img className="w-3 h-3" src={assets.mail_icon} alt="Email" />
            <input
              className="bg-transparent text-white outline-none flex-1"
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="py-2.5 text-white font-semibold text-base bg-gradient-to-r from-indigo-500 to-indigo-900 mt-3 w-full rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Sending..." : "Submit"}
          </button>
        </form>
      )}

      {/* OTP Input Form */}
      {!isOtpSubmitted && isEmailSent && (
        <form onSubmit={onSubmitOtp} className="bg-slate-900 rounded-lg shadow-lg p-8 w-96 text-sm">
          <h1 className="text-white text-2xl font-semibold text-center mb-4">
            Reset Password OTP
          </h1>
          <p className="text-center mb-6 text-indigo-300">
            Enter the 6-digit code sent to your email id.
          </p>

          <div className="flex justify-between mb-8" onPaste={handlePaste}>
            {Array(6)
              .fill(0)
              .map((_, index) => (
                <input
                  key={index}
                  className="w-12 h-12 bg-[#333A5C] text-white text-center text-xl rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  type="text"
                  maxLength="1"
                  required
                  disabled={loading}
                  ref={(e) => (inputRefs.current[index] = e)}
                  onInput={(e) => handleInput(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                />
              ))}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 text-white bg-gradient-to-r from-indigo-500 to-indigo-900 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Submit"}
          </button>
        </form>
      )}

      {/* Enter New Password Form */}
      {isOtpSubmitted && isEmailSent && (
        <form onSubmit={onSubmitNewPassword} className="bg-slate-900 rounded-lg shadow-lg p-8 w-96 text-sm">
          <h1 className="text-white text-2xl font-semibold text-center mb-4">
            New Password
          </h1>
          <p className="text-center mb-6 text-indigo-300">
            Enter your new password.
          </p>
          <div className="w-full mb-4 flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img className="w-3 h-3" src={assets.lock_icon} alt="Lock" />
            <input
              className="bg-transparent text-white outline-none flex-1"
              type="password"
              placeholder="Enter New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="py-2.5 text-white font-semibold text-base bg-gradient-to-r from-indigo-500 to-indigo-900 mt-3 w-full rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      )}
    </div>
  );
};

export default ResetPassword;
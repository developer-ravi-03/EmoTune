import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import { API_ENDPOINTS } from "../config/api";
import { toast } from "react-toastify";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/forgot-password", { email });
      toast.success("OTP sent to your email");
      navigate("/reset-password", { state: { email } });
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to send OTP";
      toast.error(msg);
      if (msg.includes("not registered") || msg.includes("sign up")) {
        setTimeout(() => {
          navigate("/register");
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 transition-colors duration-300">
      <div className="auth-card max-w-md w-full space-y-8 p-8 rounded-2xl animate-fadeIn">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-4">
          Forgot Password
        </h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
              placeholder="you@example.com"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5 cursor-pointer"
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;

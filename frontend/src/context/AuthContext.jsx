/* eslint-disable react-refresh/only-export-components */
/* eslint-disable no-unused-vars */
import { createContext, useContext, useState, useEffect } from "react";
import axios from "../utils/axios";
import { API_ENDPOINTS } from "../config/api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    verifyToken();
  }, []);

  const verifyToken = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(API_ENDPOINTS.VERIFY);
      setUser(response.data.user);
    } catch (error) {
      // token invalid or expired - clear local session
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // show a non-intrusive info toast
      // do not force redirect here; Auth consumers may decide
      toast.info("Session expired. Please sign in again.");
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(API_ENDPOINTS.LOGIN, {
        email,
        password,
      });
      localStorage.setItem("token", response.data.access_token);
      // persist user if provided
      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
      setUser(response.data.user);
      toast.success("Signed in successfully");
      return response.data;
    } catch (err) {
      const msg =
        err.response?.data?.error || "Login failed. Please try again.";
      toast.error(msg);
      throw err;
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await axios.post(API_ENDPOINTS.REGISTER, {
        name,
        email,
        password,
      });
      localStorage.setItem("token", response.data.access_token);
      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
      setUser(response.data.user);
      toast.success("Account created and signed in");
      return response.data;
    } catch (err) {
      const msg =
        err.response?.data?.error || "Registration failed. Please try again.";
      toast.error(msg);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await axios.post(API_ENDPOINTS.LOGOUT);
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed — clearing local session");
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

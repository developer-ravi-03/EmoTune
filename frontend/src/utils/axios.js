import axios from "axios";
import API_BASE_URL, { API_ENDPOINTS } from "../config/api";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // If unauthorized, clear local session and redirect to login.
    // But avoid redirecting for auth endpoints like login/register to
    // prevent interrupting the login flow where the backend returns
    // 401 for wrong credentials and the UI should show the error.
    const status = error.response?.status;
    const reqUrl = error.config?.url;

    if (
      status === 401 &&
      reqUrl &&
      !reqUrl.includes("/auth/login") &&
      !reqUrl.includes("/auth/register")
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),
  verify: () => api.get("/auth/verify"),
};

// Emotion API
export const emotionAPI = {
  detectFromImage: (formData) =>
    api.post("/emotion/detect-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  detectFromWebcam: (data) => api.post("/emotion/detect-webcam", data),
  getHistory: (params) => api.get("/emotion/history", { params }),
  getStats: () => api.get("/emotion/stats"),
};

// Music API
export const musicAPI = {
  getRecommendations: (data) => api.post("/music/recommend", data),
  getRecommendationsWithPreview: (data) =>
    api.post("/music/recommend-with-preview", data),
  getHistory: (params) => api.get("/music/history", { params }),
  getGenres: () => api.get("/music/genres"),
};

// Profile API
export const profileAPI = {
  getProfile: () => api.get("/profile"),
  updateProfile: (data) => api.put("/profile/update", data),
  changePassword: (data) => api.post("/profile/change-password", data),
  getActivity: (params) => api.get("/profile/activity", { params }),
  getSessions: () => api.get("/profile/sessions"),
  deleteAccount: (data) => api.delete("/profile/delete", { data }),
};

export default api;

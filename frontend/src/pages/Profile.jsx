import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "../utils/axios";
import { API_ENDPOINTS } from "../config/api";
import { toast } from "react-toastify";
import {
  User,
  Mail,
  Calendar,
  Music,
  Heart,
  TrendingUp,
  Lock,
  Loader,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");

  // Password change states
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.PROFILE);
      setProfile(response.data.user);
      setStats(response.data.statistics);
      setName(response.data.user.name);
    } catch (err) {
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError("");
    setSuccess("");

    try {
      await axios.put(API_ENDPOINTS.UPDATE_PROFILE, { name });
      setSuccess("Profile updated successfully");
      setIsEditing(false);
      fetchProfile();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    const trimmedCurrent = currentPassword.trim();
    const trimmedNew = newPassword.trim();
    const trimmedConfirm = confirmPassword.trim();

    const nextErrors = {
      current: "",
      new: "",
      confirm: "",
    };

    if (!trimmedCurrent) {
      nextErrors.current = "Current password is required";
    }

    if (!trimmedNew) {
      nextErrors.new = "New password is required";
    } else if (trimmedNew.length < 6) {
      nextErrors.new = "Password must be at least 6 characters";
    }

    if (!trimmedConfirm) {
      nextErrors.confirm = "Confirm password is required";
    } else if (trimmedNew !== trimmedConfirm) {
      nextErrors.confirm = "Passwords do not match";
    }

    if (trimmedCurrent && trimmedNew && trimmedCurrent === trimmedNew) {
      nextErrors.new = "New password must be different from current password";
    }

    setPasswordErrors(nextErrors);

    if (nextErrors.current || nextErrors.new || nextErrors.confirm) {
      toast.error(nextErrors.current || nextErrors.new || nextErrors.confirm);
      return;
    }

    setUpdating(true);
    setError("");
    setSuccess("");

    const toastId = toast.loading("Changing password...");

    try {
      await axios.post(API_ENDPOINTS.CHANGE_PASSWORD, {
        current_password: trimmedCurrent,
        new_password: trimmedNew,
      });
      setSuccess("Password changed successfully");
      setShowPasswordChange(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      setPasswordErrors({ current: "", new: "", confirm: "" });
      toast.update(toastId, {
        render: "Password changed successfully",
        type: "success",
        isLoading: false,
        autoClose: 2500,
        closeOnClick: true,
      });
    } catch (err) {
      const backendError =
        err.response?.data?.error || "Failed to change password";
      setError(backendError);

      if (backendError.toLowerCase().includes("current password")) {
        setPasswordErrors((prev) => ({
          ...prev,
          current: "Current password is incorrect",
        }));
      }

      toast.update(toastId, {
        render: backendError,
        type: "error",
        isLoading: false,
        autoClose: 3000,
        closeOnClick: true,
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-12 h-12 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-8 animate-fadeIn">
          My Profile
        </h1>

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="text-green-600 dark:text-green-400">{success}</p>
          </div>
        )}

        {/* Profile Card */}
        <div className="surface-card rounded-2xl p-4 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="w-20 h-20 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/30 flex-shrink-0">
                <User className="w-10 h-10 text-white" />
              </div>
              <div className="min-w-0">
                {isEditing ? (
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="text-xl sm:text-2xl font-bold px-3 py-1 border-2 border-cyan-600 rounded-lg dark:bg-gray-700 dark:text-white w-full"
                  />
                ) : (
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white break-words">
                    {profile?.name}
                  </h2>
                )}
                <p className="text-gray-600 dark:text-gray-400 flex items-center space-x-2 mt-1 text-sm sm:text-base overflow-hidden">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{profile?.email}</span>
                </p>
              </div>
            </div>

            {isEditing ? (
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:space-x-2">
                <button
                  onClick={handleUpdateProfile}
                  disabled={updating}
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors disabled:opacity-50 w-full sm:w-auto cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setName(profile?.name);
                  }}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 rounded-lg transition-colors w-full sm:w-auto cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-lg transition-colors w-full sm:w-auto cursor-pointer"
              >
                Edit Profile
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Member Since
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString("en-GB")
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="surface-card rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                <Heart className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Emotions Detected
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.total_emotions_detected || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="surface-card rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Music className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Songs Recommended
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.total_music_recommendations || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="surface-card rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Most Detected
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                  {stats?.most_detected_emotion || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Password Change */}
        <div className="surface-card rounded-2xl p-4 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6">
            <div className="flex items-center space-x-3">
              <Lock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                Change Password
              </h3>
            </div>
            <button
              onClick={() => setShowPasswordChange(!showPasswordChange)}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors w-full sm:w-auto cursor-pointer"
            >
              {showPasswordChange ? "Cancel" : "Change"}
            </button>
          </div>

          {showPasswordChange && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => {
                      setCurrentPassword(e.target.value);
                      setPasswordErrors((prev) => ({ ...prev, current: "" }));
                    }}
                    required
                    className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 dark:bg-gray-700 dark:text-white ${
                      passwordErrors.current
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 dark:border-gray-600 focus:ring-purple-600"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer transition-colors"
                    aria-label={
                      showCurrentPassword
                        ? "Hide current password"
                        : "Show current password"
                    }
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {passwordErrors.current && (
                  <p className="mt-1 text-sm text-red-500">
                    {passwordErrors.current}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setPasswordErrors((prev) => ({ ...prev, new: "" }));
                    }}
                    required
                    className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 dark:bg-gray-700 dark:text-white ${
                      passwordErrors.new
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 dark:border-gray-600 focus:ring-purple-600"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer transition-colors"
                    aria-label={
                      showNewPassword
                        ? "Hide new password"
                        : "Show new password"
                    }
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {passwordErrors.new && (
                  <p className="mt-1 text-sm text-red-500">
                    {passwordErrors.new}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setPasswordErrors((prev) => ({ ...prev, confirm: "" }));
                    }}
                    required
                    className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 dark:bg-gray-700 dark:text-white ${
                      passwordErrors.confirm
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 dark:border-gray-600 focus:ring-purple-600"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer transition-colors"
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {passwordErrors.confirm && (
                  <p className="mt-1 text-sm text-red-500">
                    {passwordErrors.confirm}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={updating}
                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-lg transition-all disabled:opacity-50 cursor-pointer"
              >
                {updating ? "Changing Password..." : "Change Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

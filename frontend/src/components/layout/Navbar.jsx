// ==================== src/components/Layout/Navbar.jsx ====================
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { Sun, Moon, User, LogOut, Music, Home } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 shadow-2xl sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Music className="w-6 h-6 text-purple-600 dark:text-purple-400 group-hover:rotate-12 transition-transform" />
            </div>
            <span className="text-2xl font-bold text-white drop-shadow-lg">
              EmoTune
            </span>
          </Link>

          {/* Navigation Links and Controls */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Home Button - Only show when logged in */}
            {user && (
              <Link
                to="/"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  isActive("/")
                    ? "bg-white/20 text-white shadow-lg"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Home className="w-5 h-5" />
                <span className="hidden sm:inline font-medium">Home</span>
              </Link>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all duration-300 hover:scale-110"
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button>

            {user && (
              <>
                {/* Profile Link */}
                <Link
                  to="/profile"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                    isActive("/profile")
                      ? "bg-white/20 text-white shadow-lg"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span className="hidden sm:inline font-medium">
                    {user.name}
                  </span>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="hidden sm:inline font-medium">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

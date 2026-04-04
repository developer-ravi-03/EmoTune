// ==================== src/components/Layout/Navbar.jsx ====================
import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import {
  Sun,
  Moon,
  User,
  LogOut,
  Music,
  Home,
  Menu,
  X,
  Loader2,
} from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    setLoggingOut(true);

    try {
      await logout();
      navigate("/login", { replace: true });
    } finally {
      setLoggingOut(false);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 border-b border-white/40 dark:border-slate-700/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl shadow-[0_10px_34px_rgba(15,23,42,0.12)] transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-16 justify-between items-center gap-3 py-2">
          <Link
            to="/"
            className="flex items-center space-x-2 group cursor-pointer"
          >
            <div className="p-2 rounded-full shadow-lg ring-1 ring-cyan-400/30 bg-gradient-to-br from-white to-cyan-50 dark:from-slate-800 dark:to-slate-900 group-hover:scale-110 transition-transform duration-300">
              <Music className="w-6 h-6 text-cyan-700 dark:text-cyan-300 group-hover:rotate-12 transition-transform" />
            </div>
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 drop-shadow-lg">
              EmoTune
            </span>
          </Link>

          <div className="hidden md:flex md:items-center md:justify-end md:flex-wrap md:gap-3">
            {!user && (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-900/10 dark:hover:bg-white/10 transition-all cursor-pointer"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-900/10 dark:hover:bg-white/10 transition-all cursor-pointer"
                >
                  Register
                </Link>
              </>
            )}

            {user && (
              <Link
                to="/"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  isActive("/")
                    ? "bg-cyan-500/20 dark:bg-cyan-400/20 text-cyan-800 dark:text-cyan-200 shadow-lg"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-900/8 dark:hover:bg-white/10"
                }`}
              >
                <Home className="w-5 h-5" />
                <span className="hidden sm:inline font-medium">Home</span>
              </Link>
            )}

            <button
              onClick={toggleTheme}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/6 dark:bg-white/10 hover:bg-slate-900/12 dark:hover:bg-white/20 text-slate-800 dark:text-slate-100 transition-all duration-300 hover:scale-[1.03] cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
              <span className="hidden sm:inline text-sm font-semibold">
                {theme === "light" ? "Dark" : "Light"}
              </span>
            </button>

            {user && (
              <>
                <Link
                  to="/profile"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                    isActive("/profile")
                      ? "bg-cyan-500/20 dark:bg-cyan-400/20 text-cyan-800 dark:text-cyan-200 shadow-lg"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-900/8 dark:hover:bg-white/10"
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span className="hidden sm:inline font-medium">
                    {user.name}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white rounded-lg transition-all duration-300 hover:scale-[1.03] shadow-lg cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loggingOut ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <LogOut className="w-5 h-5" />
                  )}
                  <span className="hidden sm:inline font-medium">
                    {loggingOut ? "Logging out..." : "Logout"}
                  </span>
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleTheme}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/6 dark:bg-white/10 hover:bg-slate-900/12 dark:hover:bg-white/20 text-slate-800 dark:text-slate-100 transition-all duration-300 cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="inline-flex items-center justify-center p-2 rounded-xl bg-slate-900/6 dark:bg-white/10 hover:bg-slate-900/12 dark:hover:bg-white/20 text-slate-800 dark:text-slate-100 transition-all duration-300 cursor-pointer"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden pb-4 animate-fadeIn">
            <div className="surface-card rounded-2xl p-3 space-y-2">
              {!user && (
                <>
                  <Link
                    to="/login"
                    className="block px-4 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-900/10 dark:hover:bg-white/10 transition-all cursor-pointer"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block px-4 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-900/10 dark:hover:bg-white/10 transition-all cursor-pointer"
                  >
                    Register
                  </Link>
                </>
              )}

              {user && (
                <>
                  <Link
                    to="/"
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                      isActive("/")
                        ? "bg-cyan-500/20 dark:bg-cyan-400/20 text-cyan-800 dark:text-cyan-200 shadow-lg"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-900/8 dark:hover:bg-white/10"
                    }`}
                  >
                    <Home className="w-5 h-5" />
                    <span className="font-medium">Home</span>
                  </Link>

                  <Link
                    to="/profile"
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                      isActive("/profile")
                        ? "bg-cyan-500/20 dark:bg-cyan-400/20 text-cyan-800 dark:text-cyan-200 shadow-lg"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-900/8 dark:hover:bg-white/10"
                    }`}
                  >
                    <User className="w-5 h-5" />
                    <span className="font-medium">{user.name}</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white rounded-lg transition-all duration-300 shadow-lg cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loggingOut ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <LogOut className="w-5 h-5" />
                    )}
                    <span className="font-medium">
                      {loggingOut ? "Logging out..." : "Logout"}
                    </span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {loggingOut && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 backdrop-blur-sm">
          <div className="surface-card flex items-center gap-3 rounded-2xl px-6 py-4 shadow-2xl">
            <Loader2 className="w-6 h-6 animate-spin text-cyan-600 dark:text-cyan-300" />
            <div>
              <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Logging out
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Please wait a moment
              </p>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

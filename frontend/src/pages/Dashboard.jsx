import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Scan, Music, History, TrendingUp, Smile, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { profileAPI, emotionAPI } from "../services/api";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [emotionStats, setEmotionStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [profileRes, emotionRes] = await Promise.all([
        profileAPI.getProfile(),
        emotionAPI.getStats(),
      ]);

      setStats(profileRes.data.statistics);
      setEmotionStats(emotionRes.data);
    } catch (error) {
      console.error("Failed to load dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const emotionColors = {
    happy: "from-yellow-400 to-orange-500",
    sad: "from-blue-400 to-indigo-600",
    angry: "from-red-500 to-pink-600",
    fear: "from-purple-400 to-indigo-500",
    surprise: "from-cyan-400 to-blue-500",
    disgust: "from-green-500 to-teal-600",
    neutral: "from-gray-400 to-slate-600",
  };

  const quickActions = [
    {
      title: "Detect Emotion",
      description: "Start detecting your emotions",
      icon: Scan,
      link: "/detect",
      color: "from-primary-500 to-blue-600",
    },
    {
      title: "View History",
      description: "See your emotion history",
      icon: History,
      link: "/history",
      color: "from-accent-500 to-purple-600",
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, <span className="gradient-text">{user?.name}</span>!
            👋
          </h1>
          <p className="text-gray-400">
            Here's your emotional journey overview
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Detections</p>
                <p className="text-3xl font-bold text-white">
                  {stats?.total_emotions_detected || 0}
                </p>
              </div>
              <div className="bg-primary-500/20 p-3 rounded-lg">
                <Smile className="w-8 h-8 text-primary-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Songs Recommended</p>
                <p className="text-3xl font-bold text-white">
                  {stats?.total_music_recommendations || 0}
                </p>
              </div>
              <div className="bg-accent-500/20 p-3 rounded-lg">
                <Music className="w-8 h-8 text-accent-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Most Detected</p>
                <p className="text-2xl font-bold text-white capitalize">
                  {stats?.most_detected_emotion || "N/A"}
                </p>
              </div>
              <div className="bg-green-500/20 p-3 rounded-lg">
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link key={index} to={action.link} className="card-hover group">
                  <div className="flex items-center gap-4">
                    <div
                      className={`bg-gradient-to-r ${action.color} p-4 rounded-xl group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-1">
                        {action.title}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </motion.div>

        {/* Emotion Distribution */}
        {emotionStats?.emotion_distribution &&
          emotionStats.emotion_distribution.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="card"
            >
              <h2 className="text-2xl font-bold text-white mb-6">
                Emotion Distribution
              </h2>
              <div className="space-y-4">
                {emotionStats.emotion_distribution.map((emotion, index) => {
                  const percentage =
                    emotionStats.total_detections > 0
                      ? (emotion.count / emotionStats.total_detections) * 100
                      : 0;

                  return (
                    <motion.div
                      key={emotion.emotion}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white capitalize font-medium">
                          {emotion.emotion}
                        </span>
                        <span className="text-gray-400">
                          {emotion.count} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="bg-dark-700 rounded-full h-3 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{
                            duration: 0.5,
                            delay: 0.7 + index * 0.1,
                          }}
                          className={`h-full bg-gradient-to-r ${
                            emotionColors[emotion.emotion.toLowerCase()] ||
                            "from-gray-400 to-gray-600"
                          }`}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

        {/* No Data State */}
        {(!emotionStats || emotionStats.total_detections === 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card text-center py-12"
          >
            <Scan className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No Emotions Detected Yet
            </h3>
            <p className="text-gray-400 mb-6">
              Start detecting your emotions to see your stats here
            </p>
            <Link
              to="/detect"
              className="btn-primary inline-flex items-center gap-2"
            >
              <Scan className="w-5 h-5" />
              Start Detecting
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

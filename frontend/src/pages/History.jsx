import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  History as HistoryIcon,
  Calendar,
  Camera,
  Image,
  Music,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { emotionAPI } from "../services/api";

const History = () => {
  const [emotionHistory, setEmotionHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadHistory();
  }, [currentPage]);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const response = await emotionAPI.getHistory({
        page: currentPage,
        limit: 10,
      });
      setEmotionHistory(response.data.history);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      console.error("Failed to load history:", error);
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

  const emotionEmojis = {
    happy: "😊",
    sad: "😢",
    angry: "😠",
    fear: "😨",
    surprise: "😲",
    disgust: "🤢",
    neutral: "😐",
  };

  if (isLoading && currentPage === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold gradient-text mb-2 flex items-center gap-3">
            <HistoryIcon className="w-10 h-10" />
            Emotion History
          </h1>
          <p className="text-gray-400">View your past emotion detections</p>
        </motion.div>

        {emotionHistory.length > 0 ? (
          <>
            {/* History List */}
            <div className="space-y-4 mb-8">
              {emotionHistory.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="card hover:border-primary-500/50 transition-all"
                >
                  <div className="flex items-center gap-6">
                    {/* Emotion Icon */}
                    <div
                      className={`text-5xl w-16 h-16 flex items-center justify-center rounded-xl bg-gradient-to-r ${
                        emotionColors[item.emotion.toLowerCase()]
                      } bg-opacity-20`}
                    >
                      {emotionEmojis[item.emotion.toLowerCase()]}
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold capitalize text-white">
                          {item.emotion}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${
                            emotionColors[item.emotion.toLowerCase()]
                          } text-white`}
                        >
                          {(item.confidence * 100).toFixed(1)}% confidence
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                          {item.detection_type === "webcam" ? (
                            <Camera className="w-4 h-4" />
                          ) : (
                            <Image className="w-4 h-4" />
                          )}
                          <span className="capitalize">
                            {item.detection_type}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(item.created_at).toLocaleDateString()} at{" "}
                            {new Date(item.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Confidence Bar */}
                    <div className="hidden md:block w-32">
                      <p className="text-xs text-gray-400 mb-2 text-center">
                        Confidence
                      </p>
                      <div className="bg-dark-700 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${
                            emotionColors[item.emotion.toLowerCase()]
                          }`}
                          style={{ width: `${item.confidence * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center gap-2"
              >
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-dark-700 text-white hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                        currentPage === i + 1
                          ? "bg-gradient-to-r from-primary-500 to-accent-500 text-white"
                          : "bg-dark-700 text-gray-400 hover:bg-dark-600"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-dark-700 text-white hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card text-center py-12"
          >
            <HistoryIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No History Yet
            </h3>
            <p className="text-gray-400 mb-6">
              Start detecting your emotions to see them here
            </p>
            <a
              href="/detect"
              className="btn-primary inline-flex items-center gap-2"
            >
              <Music className="w-5 h-5" />
              Start Detecting
            </a>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default History;

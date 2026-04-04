/* eslint-disable no-unused-vars */
import { useState, useRef, useEffect } from "react";
import {
  Camera,
  Upload,
  StopCircle,
  Loader,
  Music2,
  Sparkles,
  Image as ImageIcon,
  Video,
  CheckCircle2,
  X,
} from "lucide-react";
import axios from "../utils/axios";
import { API_ENDPOINTS } from "../config/api";
import MusicPlayer from "../components/MusicPlayer";

const Home = () => {
  const [cameraActive, setCameraActive] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [emotion, setEmotion] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [historyId, setHistoryId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [detectionSuccess, setDetectionSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const emotionResultRef = useRef(null);
  const musicSectionRef = useRef(null);
  const [preferredLanguage, setPreferredLanguage] = useState(
    localStorage.getItem("preferred_language") || "en",
  );
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
        setError("");
      }
    } catch (err) {
      setError("Failed to access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      streamRef.current = null;
      setCameraActive(false);
    }
  };

  const scrollToElement = (ref) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const captureAndDetect = async () => {
    if (!videoRef.current) return;

    setDetecting(true);
    setError("");
    setDetectionSuccess(false);

    try {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoRef.current, 0, 0);

      canvas.toBlob(async (blob) => {
        try {
          const base64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });

          const response = await axios.post(API_ENDPOINTS.DETECT_WEBCAM, {
            image: base64,
          });

          setEmotion(response.data.emotion);
          setConfidence(response.data.confidence);
          setDetectionSuccess(true);
          setHistoryId(response.data.history_id || null);

          // Scroll to emotion result
          setTimeout(() => scrollToElement(emotionResultRef), 300);

          // Show language selector before fetching recommendations
          setShowLanguageSelector(true);
        } catch (err) {
          setError(err.response?.data?.error || "Failed to detect emotion");
        } finally {
          setDetecting(false);
        }
      }, "image/jpeg");
    } catch (err) {
      setError("Failed to capture image");
      setDetecting(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    setDetecting(true);
    setError("");
    setDetectionSuccess(false);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await axios.post(API_ENDPOINTS.DETECT_IMAGE, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setEmotion(response.data.emotion);
      setConfidence(response.data.confidence);
      setDetectionSuccess(true);
      setHistoryId(response.data.history_id || null);

      // Scroll to emotion result
      setTimeout(() => scrollToElement(emotionResultRef), 300);

      // Show language selector before fetching recommendations
      setShowLanguageSelector(true);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to detect emotion");
    } finally {
      setDetecting(false);
    }
  };

  const fetchMusicRecommendations = async (
    emotionValue,
    historyId,
    language = preferredLanguage,
  ) => {
    setLoading(true);
    try {
      const response = await axios.post(API_ENDPOINTS.RECOMMEND_MUSIC, {
        emotion: emotionValue,
        emotion_history_id: historyId,
        limit: 20,
        language,
      });

      setTracks(response.data.tracks || []);

      // Scroll to music section after tracks are loaded
      setTimeout(() => scrollToElement(musicSectionRef), 800);
    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to fetch music recommendations",
      );
    } finally {
      setLoading(false);
    }
  };

  // Only load preferredLanguage from localStorage on mount
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem("preferred_language");
      if (savedLang) setPreferredLanguage(savedLang);
    } catch (e) {
      console.warn("localStorage parse error:", e);
    }
  }, []);

  // keep preferredLanguage in localStorage when changed
  useEffect(() => {
    try {
      if (preferredLanguage)
        localStorage.setItem("preferred_language", preferredLanguage);
    } catch (e) {
      // Ignore localStorage errors
    }
  }, [preferredLanguage]);

  useEffect(() => {
    return () => {
      stopCamera();
      // Cleanup preview URL
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const emotionColors = {
    happy: "from-yellow-400 to-orange-500",
    sad: "from-blue-400 to-indigo-600",
    angry: "from-red-500 to-pink-600",
    fear: "from-purple-500 to-indigo-700",
    surprise: "from-green-400 to-teal-500",
    disgust: "from-gray-500 to-slate-700",
    neutral: "from-cyan-400 to-blue-500",
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

  return (
    <div className="min-h-screen transition-all duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header with animation */}
        <div className="text-center mb-1 animate-fadeIn">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Sparkles className="w-12 h-12 text-purple-600 dark:text-purple-400 animate-pulse" />
              <div className="absolute inset-0 blur-xl bg-purple-400/50 animate-pulse"></div>
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 animate-gradient bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-500 bg-clip-text text-transparent bg-300% animate-gradient-x">
            Emotion Detection & Music
          </h1>
          <p className="text-gray-700 dark:text-gray-300 text-lg max-w-2xl mx-auto">
            Detect your emotion and get personalized music recommendations
            tailored just for you
          </p>
        </div>

        {/* Error Alert with animation */}
        {error && (
          <div className="max-w-2xl mx-auto mb-6 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-lg p-4 shadow-lg animate-shake">
            <p className="text-red-700 dark:text-red-400 text-center font-medium">
              {error}
            </p>
          </div>
        )}

        {/* Detection Methods Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Camera Section */}
          <div className="surface-card rounded-3xl p-6 sm:p-8 transform hover:scale-[1.01] transition-all duration-300">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl">
                <Video className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Webcam Detection
              </h2>
            </div>

            <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden mb-6 shadow-inner">
              <div style={{ paddingTop: "75%" }} className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {!cameraActive && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                    <div className="text-center">
                      <Camera className="w-20 h-20 text-gray-600 mx-auto mb-4 animate-bounce" />
                      <p className="text-gray-400">Camera Ready</p>
                    </div>
                  </div>
                )}
                {cameraActive && (
                  <div className="absolute top-4 right-4 flex items-center space-x-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm animate-pulse">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>Live</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {!cameraActive ? (
                <button
                  onClick={startCamera}
                  className="flex-1 flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-xl transition-all transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold cursor-pointer"
                >
                  <Camera className="w-5 h-5" />
                  <span>Start Camera</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={stopCamera}
                    className="flex-1 flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl transition-all transform hover:scale-105 shadow-lg font-semibold cursor-pointer"
                  >
                    <StopCircle className="w-5 h-5" />
                    <span>Stop</span>
                  </button>
                  <button
                    onClick={captureAndDetect}
                    disabled={detecting}
                    className="flex-1 flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg font-semibold cursor-pointer"
                  >
                    {detecting ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        <span>Detecting...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        <span>Detect Emotion</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Upload Section */}
          <div className="surface-card rounded-3xl p-6 sm:p-8 transform hover:scale-[1.01] transition-all duration-300">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl">
                <ImageIcon className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Upload Image
              </h2>
            </div>

            {!imagePreview ? (
              <div
                className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-10 sm:p-16 text-center hover:border-cyan-500 dark:hover:border-cyan-400 transition-all cursor-pointer bg-gradient-to-br from-gray-50 to-cyan-50 dark:from-gray-900 dark:to-slate-900 hover:shadow-xl group"
                onClick={() => document.getElementById("fileInput").click()}
              >
                <Upload className="w-20 h-20 mx-auto mb-4 text-gray-400 group-hover:text-purple-500 transition-colors group-hover:scale-110 transform duration-300" />
                <p className="text-gray-700 dark:text-gray-300 mb-2 font-semibold text-lg">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  PNG, JPG, GIF up to 10MB
                </p>
                <input
                  id="fileInput"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                {detecting && (
                  <div className="absolute inset-0 bg-white/90 dark:bg-gray-800/90 flex items-center justify-center rounded-2xl">
                    <Loader className="w-12 h-12 animate-spin text-purple-600" />
                  </div>
                )}
              </div>
            ) : (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-auto max-h-96 object-contain rounded-2xl border-2 border-gray-300 dark:border-gray-600"
                />
                <button
                  onClick={() => {
                    URL.revokeObjectURL(imagePreview);
                    setImagePreview(null);
                    setEmotion(null);
                    setConfidence(null);
                    document.getElementById("fileInput").value = "";
                  }}
                  className="absolute top-4 right-4 p-2 bg-red-500 hover:bg-red-600 rounded-full text-white transition-colors shadow-lg hover:scale-110 transform duration-200 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
                <input
                  id="fileInput"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                {detecting && (
                  <div className="absolute inset-0 bg-white/90 dark:bg-gray-800/90 flex items-center justify-center rounded-2xl">
                    <Loader className="w-12 h-12 animate-spin text-purple-600" />
                  </div>
                )}
              </div>
            )}

            {/* Emotion Result with animation */}
            {emotion && (
              <div
                ref={emotionResultRef}
                className={`mt-6 bg-gradient-to-r ${
                  emotionColors[emotion] || "from-purple-100 to-pink-100"
                } dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl p-6 shadow-lg animate-bounce-in border-2 border-white/50`}
              >
                <div className="flex items-center space-x-2 mb-4">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                  <h3 className="text-lg font-bold text-white">
                    Detected Emotion
                  </h3>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center space-x-3 min-w-0">
                    <span className="text-5xl">
                      {emotionEmojis[emotion] || "😊"}
                    </span>
                    <span className="text-3xl sm:text-4xl font-bold capitalize text-white drop-shadow-lg break-words">
                      {emotion}
                    </span>
                  </div>
                  <div className="text-left sm:text-right">
                    <div
                      className={`text-2xl sm:text-3xl font-bold ${
                        confidence > 75
                          ? "text-green-400"
                          : confidence > 50
                            ? "text-yellow-400"
                            : "text-red-400"
                      }`}
                    >
                      {confidence.toFixed(1)}%
                    </div>
                    <p className="text-white/80 text-sm">confidence</p>
                  </div>
                </div>
              </div>
            )}

            {/* Language selector shown after detection and before recommending */}
            {showLanguageSelector && detectionSuccess && (
              <div className="mt-6 p-4 sm:p-6 bg-white/80 dark:bg-slate-900/70 rounded-xl border border-gray-200 dark:border-cyan-500/20 shadow-md dark:shadow-cyan-950/40">
                <h4 className="font-semibold mb-3 text-gray-800 dark:text-slate-100 text-lg sm:text-xl leading-snug">
                  Choose language for recommendations
                </h4>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <select
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value)}
                    className="w-full sm:w-auto min-w-0 px-4 py-3 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-gray-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="ta">Tamil</option>
                    <option value="te">Telugu</option>
                  </select>

                  <button
                    onClick={async () => {
                      setShowLanguageSelector(false);
                      await fetchMusicRecommendations(
                        emotion,
                        historyId,
                        preferredLanguage,
                      );
                    }}
                    className="w-full sm:w-auto px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg shadow hover:opacity-95 cursor-pointer"
                  >
                    Confirm
                  </button>

                  <button
                    onClick={async () => {
                      setShowLanguageSelector(false);
                      // fetch with default or current preferredLanguage
                      await fetchMusicRecommendations(
                        emotion,
                        historyId,
                        preferredLanguage,
                      );
                    }}
                    className="w-full sm:w-auto px-4 py-3 bg-gray-200 dark:bg-slate-700/90 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-800 dark:text-slate-100 rounded-lg border border-transparent dark:border-slate-500/40 shadow cursor-pointer transition-colors"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Music Loading with animation */}
        {loading && (
          <div className="text-center py-16 animate-fadeIn">
            <div className="relative inline-block">
              <Loader className="w-16 h-16 animate-spin text-purple-600 mx-auto" />
              <div className="absolute inset-0 blur-xl bg-purple-400/50 animate-pulse"></div>
            </div>
            <p className="mt-6 text-gray-700 dark:text-gray-300 text-xl font-semibold">
              🎵 Finding perfect music for your {emotion} emotion...
            </p>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Analyzing your mood and preferences
            </p>
          </div>
        )}

        {/* Music Recommendations with animation */}
        {tracks.length > 0 && !loading && (
          <div
            ref={musicSectionRef}
            className="surface-card rounded-3xl p-6 sm:p-8 animate-slide-up"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div className="flex items-start sm:items-center space-x-3 min-w-0">
                <div className="p-3 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl animate-pulse">
                  <Music2 className="w-8 h-8 text-white" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                    Your Personalized Playlist
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 break-words">
                    Based on your {emotion} emotion
                  </p>
                </div>
              </div>
              <span className="self-start sm:self-auto px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-semibold">
                {tracks.length} tracks
              </span>
            </div>

            <MusicPlayer tracks={tracks} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [detectionSuccess, setDetectionSuccess] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const emotionResultRef = useRef(null);
  const musicSectionRef = useRef(null);

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

          // Scroll to emotion result
          setTimeout(() => scrollToElement(emotionResultRef), 300);

          await fetchMusicRecommendations(
            response.data.emotion,
            response.data.history_id
          );
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

      // Scroll to emotion result
      setTimeout(() => scrollToElement(emotionResultRef), 300);

      await fetchMusicRecommendations(
        response.data.emotion,
        response.data.history_id
      );
    } catch (err) {
      setError(err.response?.data?.error || "Failed to detect emotion");
    } finally {
      setDetecting(false);
    }
  };

  const fetchMusicRecommendations = async (emotionValue, historyId) => {
    setLoading(true);
    try {
      const response = await axios.post(API_ENDPOINTS.RECOMMEND_MUSIC, {
        emotion: emotionValue,
        emotion_history_id: historyId,
        limit: 20,
      });

      setTracks(response.data.tracks);

      // Scroll to music section after tracks are loaded
      setTimeout(() => scrollToElement(musicSectionRef), 800);
    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to fetch music recommendations"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 transition-all duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with animation */}
        <div className="text-center mb-1 animate-fadeIn">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Sparkles className="w-12 h-12 text-purple-600 dark:text-purple-400 animate-pulse" />
              <div className="absolute inset-0 blur-xl bg-purple-400/50 animate-pulse"></div>
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 animate-gradient bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent bg-300% animate-gradient-x">
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
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 transform hover:scale-[1.02] transition-all duration-300 border border-purple-100 dark:border-purple-900/50">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
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
                  className="flex-1 flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-all transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold"
                >
                  <Camera className="w-5 h-5" />
                  <span>Start Camera</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={stopCamera}
                    className="flex-1 flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl transition-all transform hover:scale-105 shadow-lg font-semibold"
                  >
                    <StopCircle className="w-5 h-5" />
                    <span>Stop</span>
                  </button>
                  <button
                    onClick={captureAndDetect}
                    disabled={detecting}
                    className="flex-1 flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg font-semibold"
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
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 transform hover:scale-[1.02] transition-all duration-300 border border-pink-100 dark:border-pink-900/50">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl">
                <ImageIcon className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Upload Image
              </h2>
            </div>

            <div
              className="relative border-3 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-16 text-center hover:border-purple-500 dark:hover:border-purple-400 transition-all cursor-pointer bg-gradient-to-br from-gray-50 to-purple-50 dark:from-gray-900 dark:to-purple-900/20 hover:shadow-xl group"
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-5xl">
                      {emotionEmojis[emotion] || "😊"}
                    </span>
                    <span className="text-4xl font-bold capitalize text-white drop-shadow-lg">
                      {emotion}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-white">
                      {(confidence * 100).toFixed(1)}%
                    </div>
                    <p className="text-white/80 text-sm">confidence</p>
                  </div>
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
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 animate-slide-up border border-purple-100 dark:border-purple-900/50"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl animate-pulse">
                  <Music2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Your Personalized Playlist
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Based on your {emotion} emotion
                  </p>
                </div>
              </div>
              <span className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-semibold">
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

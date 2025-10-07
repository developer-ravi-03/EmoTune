import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Webcam from "react-webcam";
import {
  Camera,
  CameraOff,
  Upload,
  Sparkles,
  Music,
  Loader2,
  X,
  Play,
  ExternalLink,
} from "lucide-react";
import { emotionAPI, musicAPI } from "../services/api";

const DetectEmotion = () => {
  const [mode, setMode] = useState("webcam"); // 'webcam' or 'upload'
  const [isWebcamOn, setIsWebcamOn] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isLoadingMusic, setIsLoadingMusic] = useState(false);
  const [detectionResult, setDetectionResult] = useState(null);
  const [musicTracks, setMusicTracks] = useState([]);
  const [error, setError] = useState(null);

  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Emotion colors
  const emotionColors = {
    happy: "from-yellow-400 to-orange-500",
    sad: "from-blue-400 to-indigo-600",
    angry: "from-red-500 to-pink-600",
    fear: "from-purple-400 to-indigo-500",
    surprise: "from-cyan-400 to-blue-500",
    disgust: "from-green-500 to-teal-600",
    neutral: "from-gray-400 to-slate-600",
  };

  // Emotion emojis
  const emotionEmojis = {
    happy: "😊",
    sad: "😢",
    angry: "😠",
    fear: "😨",
    surprise: "😲",
    disgust: "🤢",
    neutral: "😐",
  };

  const handleStartWebcam = () => {
    setIsWebcamOn(true);
    setSelectedImage(null);
    setError(null);
    setDetectionResult(null);
    setMusicTracks([]);
  };

  const handleStopWebcam = () => {
    setIsWebcamOn(false);
  };

  const handleCaptureWebcam = async () => {
    if (!webcamRef.current) return;

    setIsDetecting(true);
    setError(null);

    try {
      const imageSrc = webcamRef.current.getScreenshot();

      const response = await emotionAPI.detectFromWebcam({ image: imageSrc });

      setDetectionResult({
        emotion: response.data.emotion,
        confidence: response.data.confidence,
        history_id: response.data.history_id,
      });

      // Automatically get music recommendations
      await getMusicRecommendations(
        response.data.emotion,
        response.data.history_id
      );
    } catch (err) {
      setError(err.response?.data?.error || "Failed to detect emotion");
    } finally {
      setIsDetecting(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setError(null);
      setDetectionResult(null);
      setMusicTracks([]);

      // Preview image
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage({ file, preview: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDetectFromImage = async () => {
    if (!selectedImage) return;

    setIsDetecting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedImage.file);

      const response = await emotionAPI.detectFromImage(formData);

      setDetectionResult({
        emotion: response.data.emotion,
        confidence: response.data.confidence,
        history_id: response.data.history_id,
      });

      // Automatically get music recommendations
      await getMusicRecommendations(
        response.data.emotion,
        response.data.history_id
      );
    } catch (err) {
      setError(err.response?.data?.error || "Failed to detect emotion");
    } finally {
      setIsDetecting(false);
    }
  };

  const getMusicRecommendations = async (emotion, historyId) => {
    setIsLoadingMusic(true);

    try {
      const response = await musicAPI.getRecommendations({
        emotion,
        emotion_history_id: historyId,
        limit: 20,
      });

      setMusicTracks(response.data.tracks);
    } catch (err) {
      console.error("Failed to get music:", err);
      setError("Emotion detected but failed to load music recommendations");
    } finally {
      setIsLoadingMusic(false);
    }
  };

  const handleReset = () => {
    setDetectionResult(null);
    setMusicTracks([]);
    setError(null);
    setSelectedImage(null);
    if (isWebcamOn) {
      setIsWebcamOn(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold gradient-text mb-2">
            Emotion Detection & Music
          </h1>
          <p className="text-gray-400">
            Detect your emotion and get personalized music recommendations
          </p>
        </motion.div>

        {!detectionResult ? (
          <>
            {/* Mode Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center gap-4 mb-8"
            >
              <button
                onClick={() => {
                  setMode("webcam");
                  setSelectedImage(null);
                  setError(null);
                }}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  mode === "webcam"
                    ? "bg-gradient-to-r from-primary-500 to-accent-500 text-white"
                    : "bg-dark-700 text-gray-400 hover:text-white"
                }`}
              >
                <Camera className="w-5 h-5" />
                Use Webcam
              </button>
              <button
                onClick={() => {
                  setMode("upload");
                  setIsWebcamOn(false);
                  setError(null);
                }}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  mode === "upload"
                    ? "bg-gradient-to-r from-primary-500 to-accent-500 text-white"
                    : "bg-dark-700 text-gray-400 hover:text-white"
                }`}
              >
                <Upload className="w-5 h-5" />
                Upload Image
              </button>
            </motion.div>

            {/* Detection Area */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card max-w-3xl mx-auto"
            >
              {mode === "webcam" ? (
                <div className="space-y-4">
                  <div className="relative bg-dark-900 rounded-lg overflow-hidden aspect-video">
                    {isWebcamOn ? (
                      <Webcam
                        ref={webcamRef}
                        audio={false}
                        screenshotFormat="image/jpeg"
                        className="w-full h-full object-cover"
                        videoConstraints={{
                          width: 1280,
                          height: 720,
                          facingMode: "user",
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <Camera className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                          <p className="text-gray-400">
                            Click "Start Camera" to begin
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4">
                    {!isWebcamOn ? (
                      <button
                        onClick={handleStartWebcam}
                        className="btn-primary flex-1 flex items-center justify-center gap-2"
                      >
                        <Camera className="w-5 h-5" />
                        Start Camera
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={handleStopWebcam}
                          className="btn-secondary flex-1 flex items-center justify-center gap-2"
                        >
                          <CameraOff className="w-5 h-5" />
                          Stop Camera
                        </button>
                        <button
                          onClick={handleCaptureWebcam}
                          disabled={isDetecting}
                          className="btn-primary flex-1 flex items-center justify-center gap-2"
                        >
                          {isDetecting ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Detecting...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-5 h-5" />
                              Capture & Detect
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative bg-dark-900 rounded-lg overflow-hidden aspect-video">
                    {selectedImage ? (
                      <img
                        src={selectedImage.preview}
                        alt="Selected"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <Upload className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                          <p className="text-gray-400 mb-2">
                            Choose an image to detect emotion
                          </p>
                          <p className="text-sm text-gray-500">
                            Supported: JPG, PNG (Max 16MB)
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-secondary flex-1 flex items-center justify-center gap-2"
                    >
                      <Upload className="w-5 h-5" />
                      Choose Image
                    </button>
                    {selectedImage && (
                      <button
                        onClick={handleDetectFromImage}
                        disabled={isDetecting}
                        className="btn-primary flex-1 flex items-center justify-center gap-2"
                      >
                        {isDetecting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Detecting...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5" />
                            Detect Emotion
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </>
        ) : (
          <>
            {/* Detection Result */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card max-w-3xl mx-auto mb-8"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">
                  Detection Result
                </h2>
                <button
                  onClick={handleReset}
                  className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-6">
                <div
                  className={`text-6xl w-20 h-20 flex items-center justify-center rounded-full bg-gradient-to-r ${
                    emotionColors[detectionResult.emotion.toLowerCase()]
                  } bg-opacity-20`}
                >
                  {emotionEmojis[detectionResult.emotion.toLowerCase()]}
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-bold capitalize text-white mb-2">
                    {detectionResult.emotion}
                  </h3>
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Confidence</p>
                      <p className="text-lg font-semibold text-primary-400">
                        {(detectionResult.confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="flex-1 bg-dark-700 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${detectionResult.confidence * 100}%`,
                        }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className={`h-full bg-gradient-to-r ${
                          emotionColors[detectionResult.emotion.toLowerCase()]
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Music Recommendations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Music className="w-6 h-6 text-primary-400" />
                  Music Recommendations
                </h2>
                {musicTracks.length > 0 && (
                  <p className="text-gray-400">
                    {musicTracks.length} tracks found
                  </p>
                )}
              </div>

              {isLoadingMusic ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 text-primary-400 animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">
                      Loading music recommendations...
                    </p>
                  </div>
                </div>
              ) : musicTracks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {musicTracks.map((track, index) => (
                    <motion.div
                      key={track.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="card-hover group"
                    >
                      {/* Album Cover */}
                      <div className="relative aspect-square mb-3 rounded-lg overflow-hidden">
                        <img
                          src={
                            track.image_url || "https://via.placeholder.com/300"
                          }
                          alt={track.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        {track.preview_url && (
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                              onClick={() => window.open(track.preview_url)}
                              className="bg-primary-500 p-3 rounded-full hover:scale-110 transition-transform"
                            >
                              <Play className="w-5 h-5 text-white fill-white" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Track Info */}
                      <div>
                        <h3 className="font-semibold text-white truncate mb-1">
                          {track.name}
                        </h3>
                        <p className="text-sm text-gray-400 truncate mb-3">
                          {track.artist}
                        </p>

                        {/* Actions */}
                        <a
                          href={track.spotify_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors text-sm font-medium"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Open in Spotify
                        </a>
                      </div>

                      {/* Duration */}
                      <div className="mt-2 text-xs text-gray-500 text-center">
                        {Math.floor(track.duration_ms / 60000)}:
                        {String(
                          Math.floor((track.duration_ms % 60000) / 1000)
                        ).padStart(2, "0")}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="card text-center py-12">
                  <Music className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">
                    No music recommendations available
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default DetectEmotion;

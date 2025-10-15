import { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  ExternalLink,
  Volume2,
} from "lucide-react";

const MusicPlayer = ({ tracks }) => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef(null);

  const currentTrack = tracks[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
  }, [currentTrackIndex]);

  const togglePlayPause = () => {
    if (!currentTrack?.preview_url) return;

    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  const playNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
  };

  const playPrevious = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const seekTime = (e.target.value / 100) * duration;
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-4">
      {/* Current Track Display */}
      <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl p-6 flex items-center space-x-4">
        {currentTrack?.image_url && (
          <img
            src={currentTrack.image_url}
            alt={currentTrack.name}
            className="w-20 h-20 rounded-lg shadow-lg"
          />
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
            {currentTrack?.name}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 truncate">
            {currentTrack?.artist}
          </p>
          {!currentTrack?.preview_url && (
            <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
              Preview not available
            </p>
          )}
        </div>
        {currentTrack?.spotify_url && (
          <a
            href={currentTrack.spotify_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline">Spotify</span>
          </a>
        )}
      </div>

      {/* Audio Player */}
      {currentTrack?.preview_url && (
        <>
          <audio
            ref={audioRef}
            src={currentTrack.preview_url}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={playNext}
          />

          {/* Progress Bar */}
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="100"
              value={(currentTime / duration) * 100 || 0}
              onChange={handleSeek}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={playPrevious}
                className="p-3 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              <button
                onClick={togglePlayPause}
                className="p-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transition-all transform hover:scale-105"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6" />
                )}
              </button>

              <button
                onClick={playNext}
                className="p-3 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center space-x-2">
              <Volume2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <input
                type="range"
                min="0"
                max="100"
                value={volume * 100}
                onChange={(e) => setVolume(e.target.value / 100)}
                className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </>
      )}

      {/* Track List */}
      <div className="max-h-96 overflow-y-auto space-y-2">
        {tracks.map((track, index) => (
          <div
            key={track.id || index}
            onClick={() => setCurrentTrackIndex(index)}
            className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all ${
              index === currentTrackIndex
                ? "bg-purple-100 dark:bg-purple-900/30"
                : "hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            {track.image_url && (
              <img
                src={track.image_url}
                alt={track.name}
                className="w-12 h-12 rounded"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-white truncate">
                {track.name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {track.artist}
              </p>
            </div>
            {track.preview_url ? (
              <Play className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
            ) : (
              <span className="text-xs text-gray-500 flex-shrink-0">
                No preview
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MusicPlayer;

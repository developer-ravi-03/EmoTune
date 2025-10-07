import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Music, Scan, Sparkles, ArrowRight, Heart, Zap, Shield } from 'lucide-react';

const Landing = () => {
  const features = [
    {
      icon: Scan,
      title: 'Emotion Detection',
      description: 'AI-powered facial recognition detects your emotions in real-time',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Music,
      title: 'Smart Recommendations',
      description: 'Get personalized music from Spotify based on your mood',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Heart,
      title: 'Track Your Mood',
      description: 'Monitor your emotional journey with detailed analytics',
      color: 'from-red-500 to-orange-500',
    },
  ];

  const stats = [
    { value: '7', label: 'Emotions Detected' },
    { value: '1M+', label: 'Songs Available' },
    { value: '99%', label: 'Accuracy Rate' },
  ];

  return (
    <div className="min-h-screen bg-dark-900 overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-500/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2"
          >
            <div className="bg-gradient-to-r from-primary-500 to-accent-500 p-2 rounded-lg">
              <Music className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">EmoTune</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-
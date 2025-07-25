import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Settings, 
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface VoiceControlsProps {
  isListening: boolean;
  isSpeaking: boolean;
  isVoiceMode: boolean;
  voiceError: string | null;
  onStartListening: () => void;
  onStopListening: () => void;
  onToggleVoiceMode: () => void;
  onStopSpeaking: () => void;
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  onVoiceSelect: (voice: SpeechSynthesisVoice) => void;
  className?: string;
}

export const VoiceControls: React.FC<VoiceControlsProps> = ({
  isListening,
  isSpeaking,
  isVoiceMode,
  voiceError,
  onStartListening,
  onStopListening,
  onToggleVoiceMode,
  onStopSpeaking,
  voices,
  selectedVoice,
  onVoiceSelect,
  className = ''
}) => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Voice Input Button */}
      <motion.button
        onClick={isListening ? onStopListening : onStartListening}
        className={`p-2 rounded-full transition-all duration-200 ${
          isListening
            ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title={isListening ? 'Stop listening' : 'Start voice input'}
      >
        {isListening ? (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            <Mic className="w-5 h-5" />
          </motion.div>
        ) : (
          <MicOff className="w-5 h-5" />
        )}
      </motion.button>

      {/* Voice Mode Toggle */}
      <motion.button
        onClick={onToggleVoiceMode}
        className={`p-2 rounded-full transition-all duration-200 ${
          isVoiceMode
            ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title={isVoiceMode ? 'Disable voice responses' : 'Enable voice responses'}
      >
        {isVoiceMode ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
      </motion.button>

      {/* Stop Speaking Button (when speaking) */}
      <AnimatePresence>
        {isSpeaking && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={onStopSpeaking}
            className="p-2 rounded-full bg-orange-500 text-white hover:bg-orange-600 transition-all duration-200 shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Stop speaking"
          >
            <VolumeX className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Voice Settings */}
      <motion.button
        onClick={() => setShowSettings(!showSettings)}
        className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="Voice settings"
      >
        <Settings className="w-5 h-5" />
      </motion.button>

      {/* Voice Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Voice Settings
                </h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Voice Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Voice Selection
                </label>
                <select
                  value={selectedVoice?.name || ''}
                  onChange={(e) => {
                    const voice = voices.find(v => v.name === e.target.value);
                    if (voice) onVoiceSelect(voice);
                  }}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                >
                  {voices
                    .sort((a, b) => {
                      // Prioritize Arabic and English voices
                      const aIsArabic = a.lang.startsWith('ar');
                      const bIsArabic = b.lang.startsWith('ar');
                      const aIsEnglish = a.lang.startsWith('en');
                      const bIsEnglish = b.lang.startsWith('en');
                      
                      if (aIsArabic && !bIsArabic) return -1;
                      if (!aIsArabic && bIsArabic) return 1;
                      if (aIsEnglish && !bIsEnglish) return -1;
                      if (!aIsEnglish && bIsEnglish) return 1;
                      
                      return a.name.localeCompare(b.name);
                    })
                    .map((voice) => (
                    <option key={voice.name} value={voice.name}>
                      {voice.lang.startsWith('ar') ? '🇸🇦' : voice.lang.startsWith('en') ? '🇺🇸' : '🌐'} {voice.name} ({voice.lang})
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Indicators */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  {isListening ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-gray-300 dark:bg-gray-600" />
                  )}
                  <span className="text-gray-700 dark:text-gray-300">
                    Voice Input: {isListening ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  {isVoiceMode ? (
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-gray-300 dark:bg-gray-600" />
                  )}
                  <span className="text-gray-700 dark:text-gray-300">
                    Voice Responses: {isVoiceMode ? 'Enabled' : 'Disabled'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  {isSpeaking ? (
                    <Volume2 className="w-4 h-4 text-orange-500" />
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-gray-300 dark:bg-gray-600" />
                  )}
                  <span className="text-gray-700 dark:text-gray-300">
                    Currently: {isSpeaking ? 'Speaking' : 'Silent'}
                  </span>
                </div>
              </div>

              {/* Error Display */}
              {voiceError && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-700 dark:text-red-300">
                      {voiceError}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
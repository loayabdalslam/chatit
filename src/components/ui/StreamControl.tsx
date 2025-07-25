import React from 'react';
import { motion } from 'framer-motion';
import { Square, Loader2 } from 'lucide-react';

interface StreamControlProps {
  isStreaming: boolean;
  onStop: () => void;
  className?: string;
}

export const StreamControl: React.FC<StreamControlProps> = ({
  isStreaming,
  onStop,
  className = ''
}) => {
  if (!isStreaming) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`flex items-center justify-center ${className}`}
    >
      <button
        onClick={onStop}
        className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl"
      >
        <Square className="w-4 h-4 fill-current" />
        <span className="font-medium">Stop Stream</span>
        <Loader2 className="w-4 h-4 animate-spin" />
      </button>
    </motion.div>
  );
};
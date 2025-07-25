import React from 'react';
import { motion } from 'framer-motion';
import { Search, Globe, FileText, Brain } from 'lucide-react';

interface ProgressBarProps {
  progress: number;
  currentTask: string;
  isVisible: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  currentTask, 
  isVisible 
}) => {
  if (!isVisible) return null;

  const getTaskIcon = (task: string) => {
    if (task.includes('keywords')) return <Brain className="w-4 h-4" />;
    if (task.includes('searching')) return <Search className="w-4 h-4" />;
    if (task.includes('scanning')) return <FileText className="w-4 h-4" />;
    return <Globe className="w-4 h-4" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="text-blue-600 dark:text-blue-400">
          {getTaskIcon(currentTask)}
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Deep Research in Progress
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {currentTask}
          </p>
        </div>
        <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
          {Math.round(progress)}%
        </div>
      </div>
      
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <motion.div
          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      
      <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
        <span>Analyzing sources...</span>
        <span>{Math.round(progress)}/100</span>
      </div>
    </motion.div>
  );
};
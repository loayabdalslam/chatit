import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Lightbulb, CheckCircle, ArrowRight } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ReasoningCardProps {
  reasoning: string;
  isVisible: boolean;
  isStreaming?: boolean;
  className?: string;
}

export const ReasoningCard: React.FC<ReasoningCardProps> = ({
  reasoning,
  isVisible,
  isStreaming = false,
  className = ''
}) => {
  if (!isVisible || !reasoning) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-6 mb-6 border border-purple-200 dark:border-purple-700 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            AI Reasoning Process
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Step-by-step analysis and methodology
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isStreaming ? (
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Reasoning...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Complete</span>
            </div>
          )}
        </div>
      </div>

      {/* Reasoning Steps */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
        <div className="flex items-center gap-2 mb-3">
          <ArrowRight className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
            Reasoning Methodology
          </span>
        </div>
        
        <div className="prose prose-sm max-w-none">
          <MarkdownRenderer content={reasoning} />
          {isStreaming && (
            <span className="animate-pulse bg-purple-400 w-2 h-5 inline-block ml-1" />
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-full text-xs text-purple-700 dark:text-purple-300">
          <Brain className="w-3 h-3" />
          <span>AI-powered reasoning analysis</span>
        </div>
      </div>
    </motion.div>
  );
};
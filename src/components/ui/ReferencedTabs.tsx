import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Loader2, CheckCircle, XCircle, Globe } from 'lucide-react';
import { SearchResult, searchService } from '../../services/searchService';
import { useTranslation } from 'react-i18next';

interface ReferencedTabsProps {
  searchResults: SearchResult[];
  onUpdateResult: (id: string, updates: Partial<SearchResult>) => void;
}

export const ReferencedTabs: React.FC<ReferencedTabsProps> = ({
  searchResults,
  onUpdateResult,
}) => {
  const { t } = useTranslation();
  const [expandedTab, setExpandedTab] = useState<string | null>(null);

  useEffect(() => {
    // Auto-scan content for pending results
    searchResults.forEach(async (result) => {
      if (result.scanStatus === 'pending') {
        onUpdateResult(result.id, { scanStatus: 'scanning' });
        
        const scanResult = await searchService.scanContent(result.url);
        onUpdateResult(result.id, {
          content: scanResult.content,
          scanStatus: scanResult.scanStatus,
        });
      }
    });
  }, [searchResults, onUpdateResult]);

  const getScanStatusIcon = (status: SearchResult['scanStatus']) => {
    switch (status) {
      case 'pending':
        return <div className="w-2 h-2 bg-gray-400 rounded-full" />;
      case 'scanning':
        return <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      case 'error':
        return <XCircle className="w-3 h-3 text-red-500" />;
      default:
        return <div className="w-2 h-2 bg-gray-400 rounded-full" />;
    }
  };

  const getScanStatusText = (status: SearchResult['scanStatus']) => {
    switch (status) {
      case 'pending':
        return t('tabs.status.pending');
      case 'scanning':
        return t('tabs.status.scanning');
      case 'completed':
        return t('tabs.status.completed');
      case 'error':
        return t('tabs.status.error');
      default:
        return t('tabs.status.pending');
    }
  };

  if (searchResults.length === 0) return null;

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Globe className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('tabs.title')} ({searchResults.length})
        </span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <AnimatePresence>
          {searchResults.map((result) => (
            <motion.div
              key={result.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-md transition-all duration-200 cursor-pointer"
              onClick={() => setExpandedTab(expandedTab === result.id ? null : result.id)}
            >
              <div className="flex items-start gap-3">
                {/* Favicon */}
                <div className="flex-shrink-0 w-6 h-6 mt-0.5">
                  {result.favicon ? (
                    <img
                      src={result.favicon}
                      alt=""
                      className="w-full h-full rounded"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className="w-full h-full bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center hidden">
                    <Globe className="w-3 h-3 text-gray-500" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  {/* Title */}
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2 mb-1">
                    {result.title}
                  </h3>
                  
                  {/* Domain */}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    {result.domain}
                  </p>
                  
                  {/* Scan Status */}
                  <div className="flex items-center gap-2">
                    {getScanStatusIcon(result.scanStatus)}
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {getScanStatusText(result.scanStatus)}
                    </span>
                  </div>
                </div>

                {/* External Link */}
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Expanded Content */}
              <AnimatePresence>
                {expandedTab === result.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700"
                  >
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      {result.snippet}
                    </p>
                    
                    {result.content && result.scanStatus === 'completed' && (
                      <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                        <p className="text-xs text-gray-700 dark:text-gray-300">
                          {result.content}
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
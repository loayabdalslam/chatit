import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ExternalLink, 
  Globe, 
  FileText, 
  Star, 
  TrendingUp, 
  Clock, 
  BookOpen,
  Building,
  Users,
  BarChart3,
  Award,
  ChevronDown,
  ChevronUp,
  Filter,
  SortDesc,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { SearchResult, searchService } from '../../services/searchService';
import { MarkdownRenderer } from './MarkdownRenderer';

interface DeepResearchResultsProps {
  results: SearchResult[];
  query: string;
  isVisible: boolean;
  onLoadMore?: () => void;
  aiResponse?: string;
}

export const DeepResearchResults: React.FC<DeepResearchResultsProps> = ({
  results,
  query,
  isVisible,
  onLoadMore,
  aiResponse
}) => {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'credibility'>('relevance');
  const [filterBy, setFilterBy] = useState<string>('all');
  const [visibleResults, setVisibleResults] = useState(20);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isCarouselExpanded, setIsCarouselExpanded] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({});

  const resultsPerPage = 9; // 3x3 grid
  const totalPages = Math.ceil(results.length / resultsPerPage);

  // Smart scroll functionality
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.innerHeight + window.scrollY;
      const documentHeight = document.documentElement.offsetHeight;
      
      if (scrollPosition >= documentHeight - 1000 && !isLoadingMore && visibleResults < results.length) {
        loadMoreResults();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [visibleResults, results.length, isLoadingMore]);

  const loadMoreResults = async () => {
    if (isLoadingMore) return;
    
    setIsLoadingMore(true);
    
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setVisibleResults(prev => Math.min(prev + 10, results.length));
    setIsLoadingMore(false);
    
    if (onLoadMore && visibleResults >= results.length - 5) {
      onLoadMore();
    }
  };

  if (!isVisible || results.length === 0) return null;

  // Enhanced categorization
  const groupedResults = results.reduce((acc, result) => {
    const category = result.sourceType || result.category || 'general';
    if (!acc[category]) acc[category] = [];
    acc[category].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  // Sort results based on selected criteria
  const sortedResults = [...results].sort((a, b) => {
    switch (sortBy) {
      case 'relevance':
        return (b.relevanceScore || 0) - (a.relevanceScore || 0);
      case 'date':
        if (!a.publishDate || !b.publishDate) return 0;
        return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
      case 'credibility':
        return (b.authorCredibility || 0) - (a.authorCredibility || 0);
      default:
        return 0;
    }
  });

  // Filter results
  const filteredResults = filterBy === 'all' 
    ? sortedResults 
    : sortedResults.filter(result => result.sourceType === filterBy || result.category === filterBy);

  // Paginated results for carousel
  const paginatedResults = [];
  for (let i = 0; i < filteredResults.length; i += resultsPerPage) {
    paginatedResults.push(filteredResults.slice(i, i + resultsPerPage));
  }

  const currentResults = paginatedResults[currentPage] || [];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'academic': return <BookOpen className="w-4 h-4" />;
      case 'news': return <TrendingUp className="w-4 h-4" />;
      case 'industry': return <Building className="w-4 h-4" />;
      case 'government': return <Award className="w-4 h-4" />;
      case 'expert': return <Users className="w-4 h-4" />;
      case 'statistical': return <BarChart3 className="w-4 h-4" />;
      case 'general': return <Globe className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getSourceTypeColor = (sourceType: string) => {
    switch (sourceType) {
      case 'academic': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'news': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      case 'industry': return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
      case 'government': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'expert': return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';
      case 'statistical': return 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  // Calculate enhanced statistics
  const stats = {
    totalSources: results.length,
    analyzed: results.filter(r => r.scanStatus === 'completed').length,
    categories: Object.keys(groupedResults).length,
    avgRelevance: Math.round(results.reduce((acc, r) => acc + (r.relevanceScore || 0), 0) / results.length),
    avgCredibility: Math.round(results.reduce((acc, r) => acc + (r.authorCredibility || 0), 0) / results.length),
    recentSources: results.filter(r => {
      if (!r.publishDate) return false;
      const daysSince = (Date.now() - new Date(r.publishDate).getTime()) / (1000 * 60 * 60 * 24);
      return daysSince <= 30;
    }).length
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 mb-6 border border-blue-200 dark:border-gray-700"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Enhanced Deep Research Results
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Comprehensive analysis for: "{query}"
          </p>
        </div>
        <div className="bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full">
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
            {results.length} sources
          </span>
        </div>
      </div>

      {/* AI Response Section with Collapsible */}
      {aiResponse && (
        <div className="mb-6">
          <div 
            className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
            onClick={() => toggleSection('ai-response')}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Comprehensive Research Analysis
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  5000+ word detailed analysis • {Math.round(aiResponse.length / 5)} words
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                Markdown Formatted
              </span>
              {expandedSections['ai-response'] ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </div>
          </div>
          
          <AnimatePresence>
            {expandedSections['ai-response'] && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto"
              >
                <div className="prose prose-sm max-w-none">
                  <MarkdownRenderer content={aiResponse} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Enhanced Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 text-center">
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {stats.totalSources}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Total Sources
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 text-center">
          <div className="text-lg font-bold text-green-600 dark:text-green-400">
            {stats.analyzed}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Analyzed
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 text-center">
          <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
            {stats.categories}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Categories
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 text-center">
          <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
            {stats.avgRelevance}%
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Avg. Relevance
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 text-center">
          <div className="text-lg font-bold text-cyan-600 dark:text-cyan-400">
            {stats.avgCredibility}%
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Avg. Credibility
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 text-center">
          <div className="text-lg font-bold text-red-600 dark:text-red-400">
            {stats.recentSources}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Recent (30d)
          </div>
        </div>
      </div>

      {/* Sources Section with Collapsible Header */}
      <div className="mb-4">
        <div 
          className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
          onClick={() => toggleSection('sources')}
        >
          <div className="flex items-center gap-3">
            <Globe className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Research Sources
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {results.length} comprehensive sources across {stats.categories} categories
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsCarouselExpanded(!isCarouselExpanded);
              }}
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              {isCarouselExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            {expandedSections['sources'] ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </div>
        </div>

        <AnimatePresence>
          {expandedSections['sources'] && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4"
            >
              {/* Controls */}
              <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <SortDesc className="w-4 h-4 text-gray-500" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    <option value="relevance">Sort by Relevance</option>
                    <option value="date">Sort by Date</option>
                    <option value="credibility">Sort by Credibility</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value)}
                    className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    <option value="all">All Sources</option>
                    <option value="academic">Academic Papers</option>
                    <option value="news">News Articles</option>
                    <option value="industry">Industry Reports</option>
                    <option value="government">Government</option>
                    <option value="expert">Expert Opinions</option>
                    <option value="statistical">Statistical Data</option>
                  </select>
                </div>

                <div className="ml-auto text-sm text-gray-600 dark:text-gray-400">
                  Page {currentPage + 1} of {totalPages} • {filteredResults.length} total sources
                </div>
              </div>

              {/* Carousel Navigation */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const pageIndex = Math.max(0, Math.min(totalPages - 5, currentPage - 2)) + i;
                    return (
                      <button
                        key={pageIndex}
                        onClick={() => setCurrentPage(pageIndex)}
                        className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                          currentPage === pageIndex
                            ? 'bg-blue-600 text-white'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750'
                        }`}
                      >
                        {pageIndex + 1}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage === totalPages - 1}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* 3x3 Grid Layout */}
              <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 transition-all duration-300 ${
                isCarouselExpanded ? 'min-h-[800px]' : 'min-h-[600px]'
              }`}>
                <AnimatePresence mode="wait">
                  {currentResults.map((result, index) => (
                    <motion.div
                      key={`${currentPage}-${result.id}`}
                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 cursor-pointer group h-fit"
                      onClick={() => setExpandedCard(expandedCard === result.id ? null : result.id)}
                    >
                      <div className="p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="flex-shrink-0 w-8 h-8 mt-1">
                            <img
                              src={result.favicon || `https://www.google.com/s2/favicons?domain=${result.domain}&sz=32`}
                              alt=""
                              className="w-full h-full rounded"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                            <div className="w-full h-full bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center hidden">
                              <Globe className="w-4 h-4 text-gray-500" />
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              {result.sourceType && (
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSourceTypeColor(result.sourceType)}`}>
                                  {result.sourceType}
                                </span>
                              )}
                              {result.publishDate && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(result.publishDate).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {result.title}
                            </h4>
                            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-2">
                              {result.domain}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                              {result.snippet}
                            </p>
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <a
                              href={result.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-shrink-0 p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                            
                            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                              {expandedCard === result.id ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Enhanced Metrics */}
                        <div className="grid grid-cols-3 gap-4 mb-3">
                          {result.relevanceScore && (
                            <div className="text-center">
                              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-1">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${result.relevanceScore}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {result.relevanceScore}% relevance
                              </span>
                            </div>
                          )}
                          
                          {result.authorCredibility && (
                            <div className="text-center">
                              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-1">
                                <div 
                                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${result.authorCredibility}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {result.authorCredibility}% credibility
                              </span>
                            </div>
                          )}

                          <div className="text-center">
                            <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${
                              result.scanStatus === 'completed' ? 'bg-green-500' :
                              result.scanStatus === 'scanning' ? 'bg-yellow-500 animate-pulse' :
                              result.scanStatus === 'error' ? 'bg-red-500' : 'bg-gray-400'
                            }`} />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {result.scanStatus === 'completed' ? 'Analyzed' :
                               result.scanStatus === 'scanning' ? 'Analyzing' :
                               result.scanStatus === 'error' ? 'Error' : 'Pending'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Content */}
                      <AnimatePresence>
                        {expandedCard === result.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="border-t border-gray-200 dark:border-gray-700 p-4"
                          >
                            {result.content && result.scanStatus === 'completed' && (
                              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <Clock className="w-3 h-3 text-gray-500" />
                                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                    Analyzed Content
                                  </span>
                                </div>
                                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                                  {result.content}
                                </p>
                              </div>
                            )}
                            
                            {result.keywords && result.keywords.length > 0 && (
                              <div className="mb-3">
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                  Related Keywords:
                                </span>
                                <div className="flex flex-wrap gap-1">
                                  {result.keywords.slice(0, 8).map((keyword, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded-full"
                                    >
                                      {keyword}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Additional metadata */}
                            <div className="grid grid-cols-2 gap-4 text-xs text-gray-600 dark:text-gray-400">
                              <div>
                                <span className="font-medium">Source Type:</span> {result.sourceType || 'General'}
                              </div>
                              <div>
                                <span className="font-medium">Category:</span> {result.category || 'General'}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Carousel Footer */}
              <div className="mt-6 flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {currentResults.length} of {filteredResults.length} sources
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    Page {currentPage + 1} of {totalPages}
                  </span>
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i === currentPage % 3 ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Research completion indicator */}
      <div className="mt-6 text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
        <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-300">
          <Star className="w-4 h-4" />
          <span className="text-sm font-medium">
            Deep research completed with {results.length} comprehensive sources and 5000+ word analysis!
          </span>
        </div>
      </div>
    </motion.div>
  );
};
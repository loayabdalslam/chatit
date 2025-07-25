"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import {
  Search,
  Mic,
  ArrowUp,
  Plus,
  FileText,
  Code,
  BookOpen,
  PenTool,
  BrainCircuit,
  Volume2,
  VolumeX,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { geminiService } from '../../services/geminiService';
import { useAppStore } from '../../store/useAppStore';
import { searchService, type SearchResult } from '../../services/searchService';
import { MarkdownRenderer } from './MarkdownRenderer';
import { ProgressBar } from './ProgressBar';
import { DeepResearchResults } from './DeepResearchResults';
import { StreamControl } from './StreamControl';
import { ReasoningCard } from './ReasoningCard';
import { VoiceAssistant3D } from './VoiceAssistant3D';
import { useVoiceRecognition } from '../../hooks/useVoiceRecognition';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';

export function AIAssistantInterface() {
  const [inputValue, setInputValue] = useState("");
  const [searchEnabled, setSearchEnabled] = useState(false);
  const [deepResearchEnabled, setDeepResearchEnabled] = useState(false);
  const [reasonEnabled, setReasonEnabled] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [showUploadAnimation, setShowUploadAnimation] = useState(false);
  const [activeCommandCategory, setActiveCommandCategory] = useState<string | null>(null);
  const [messages, setMessages] = useState<Array<{id: string, type: 'user' | 'assistant', content: string, timestamp: Date, isStreaming?: boolean}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResultsByMessage, setSearchResultsByMessage] = useState<{[messageId: string]: SearchResult[]}>({});
  const [deepResearchProgress, setDeepResearchProgress] = useState(0);
  const [deepResearchTask, setDeepResearchTask] = useState('');
  const [showDeepResearchProgress, setShowDeepResearchProgress] = useState(false);
  const [deepResearchResultsByMessage, setDeepResearchResultsByMessage] = useState<{[messageId: string]: SearchResult[]}>({});
  const [reasoningByMessage, setReasoningByMessage] = useState<{[messageId: string]: string}>({});
  const [isAssistantStreaming, setIsAssistantStreaming] = useState(false);
  const [currentStreamController, setCurrentStreamController] = useState<AbortController | null>(null);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [showVoiceAssistant, setShowVoiceAssistant] = useState(false);
  const [isVoiceInput, setIsVoiceInput] = useState(false);
  const [voiceInputTimeout, setVoiceInputTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { searchMode } = useAppStore();
  
  // Voice recognition hook
  const {
    isListening,
    transcript,
    confidence,
    isSupported: isVoiceSupported,
    startListening,
    stopListening,
    resetTranscript,
    error: voiceError
  } = useVoiceRecognition();
  
  // Text-to-speech hook
  const {
    isSpeaking,
    isSupported: isTTSSupported,
    speak,
    stop: stopSpeaking,
    voices,
    selectedVoice,
    setSelectedVoice,
    error: ttsError
  } = useTextToSpeech();
  
  // Enhanced voice transcript handling with complete input detection
  useEffect(() => {
    if (transcript && transcript.trim().length > 0) {
      setInputValue(transcript);
      
      // Clear existing timeout
      if (voiceInputTimeout) {
        clearTimeout(voiceInputTimeout);
      }
      
      // Set new timeout to wait for complete input
      const timeout = setTimeout(() => {
        if (transcript.trim().length > 3 && !isListening) {
          console.log('🎤 Complete voice input detected:', transcript);
          setIsVoiceInput(true);
          handleSendMessage();
          resetTranscript();
          setIsVoiceInput(false);
        }
      }, 1200); // Wait 1.2 seconds for complete input
      
      setVoiceInputTimeout(timeout);
    }
  }, [transcript, isListening]);
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (voiceInputTimeout) {
        clearTimeout(voiceInputTimeout);
      }
    };
  }, [voiceInputTimeout]);
  
  // Enhanced voice response handling
  useEffect(() => {
    if (isVoiceMode && messages.length > 0 && isTTSSupported) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.type === 'assistant' && !lastMessage.isStreaming && lastMessage.content && lastMessage.content.trim().length > 0) {
        let textContent = lastMessage.content;
        
        // Clean up content for voice
        textContent = textContent
          .replace(/[#*`_~]/g, '') // Remove markdown formatting
          .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to text
          .replace(/\n+/g, ' ') // Replace newlines with spaces
          .replace(/\s+/g, ' ') // Normalize whitespace
          .replace(/\*\*/g, '') // Remove bold markdown
          .replace(/\*/g, '') // Remove italic markdown
          .replace(/>/g, '') // Remove blockquote markers
          .trim();
        
        if (isVoiceInput) {
          // For voice input, use only the first sentence
          const sentences = textContent.split(/[.!?]+/).filter(s => s.trim().length > 0);
          textContent = sentences[0]?.trim();
          if (textContent && !textContent.match(/[.!?]$/)) {
            textContent += '.';
          }
        }
        
        if (textContent && textContent.length > 5) {
          console.log('🔊 Speaking response:', textContent.substring(0, 50) + '...');
          // Add a small delay to ensure the message is fully rendered
          setTimeout(() => {
            // Limit voice response to 3 sentences maximum
            const sentences = textContent.split(/[.!?]+/).filter(s => s.trim().length > 0);
            const limitedResponse = sentences.slice(0, 3).join('. ') + (sentences.length > 3 ? '.' : '');
            speak(limitedResponse);
          }, 500);
        }
      }
    }
  }, [messages, isVoiceMode, isVoiceInput, speak, isTTSSupported]);
  
  const handleVoiceStart = () => {
    console.log('🎤 Starting voice assistant...');
    if (isSpeaking) {
      stopSpeaking();
    }
    setShowVoiceAssistant(true);
    setIsVoiceMode(true);
    startListening();
  };
  
  const handleVoiceStop = () => {
    console.log('🎤 Stopping voice input...');
    stopListening();
    if (voiceInputTimeout) {
      clearTimeout(voiceInputTimeout);
      setVoiceInputTimeout(null);
    }
  };
  
  const handleToggleVoiceMode = () => {
    const newVoiceMode = !isVoiceMode;
    setIsVoiceMode(newVoiceMode);
    
    if (newVoiceMode) {
      setShowVoiceAssistant(true);
      console.log('🔊 Voice mode enabled - AI will speak responses');
    } else {
      console.log('🔊 Voice mode disabled');
      if (isSpeaking) {
        stopSpeaking();
      }
    }
  };

  // Auto-scroll to bottom after AI responses
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }, 100);
  };

  const commandSuggestions = {
    learn: [
      "Explain the Big Bang theory",
      "How does photosynthesis work?",
      "What are black holes?",
      "Explain quantum computing",
      "How does the human brain work?",
    ],
    code: [
      "Create a React component for a todo list",
      "Write a Python function to sort a list",
      "How to implement authentication in Next.js",
      "Explain async/await in JavaScript",
      "Create a CSS animation for a button",
    ],
    write: [
      "Write a professional email to a client",
      "Create a product description for a smartphone",
      "Draft a blog post about AI",
      "Write a creative story about space exploration",
      "Create a social media post about sustainability",
    ],
  };

  const handleUploadFile = () => {
    setShowUploadAnimation(true);

    // Simulate file upload with timeout
    setTimeout(() => {
      const newFile = `Document.pdf`;
      setUploadedFiles((prev) => [...prev, newFile]);
      setShowUploadAnimation(false);
    }, 1500);
  };

  const handleCommandSelect = (command: string) => {
    setInputValue(command);
    setActiveCommandCategory(null);

    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleStopStream = () => {
    if (currentStreamController) {
      currentStreamController.abort();
      setCurrentStreamController(null);
      setIsAssistantStreaming(false);
      
      // Mark the last streaming message as stopped
      setMessages(prev => prev.map(msg => 
        msg.isStreaming 
          ? { ...msg, content: msg.content + '\n\n*[Response stopped by user]*', isStreaming: false }
          : msg
      ));
    }
  };

  const handleSendMessage = async () => {
    if (inputValue.trim()) {
      const userMessage = {
        id: Date.now().toString(),
        type: 'user' as const,
        content: inputValue.trim(),
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      const query = inputValue.trim();
      const messageId = userMessage.id;
      setInputValue("");
      setIsLoading(true);
      setIsAssistantStreaming(true);
      
      // Create abort controller for this request
      const abortController = new AbortController();
      setCurrentStreamController(abortController);
      
      try {
        // Perform search or deep research
        let currentSearchResults: SearchResult[] = [];
        if (searchEnabled || deepResearchEnabled) {
          console.log('🔍 Search enabled, performing web search...');
          
          if (deepResearchEnabled) {
            // Deep Research Mode
            setShowDeepResearchProgress(true);
            setDeepResearchProgress(0);
            setDeepResearchTask('Generating comprehensive keywords...');
            
            const progressCallback = (progress: number, task: string) => {
              setDeepResearchProgress(progress);
              setDeepResearchTask(task);
            };
            
            const deepSearchResponse = await searchService.deepResearch(query, progressCallback);
            currentSearchResults = deepSearchResponse.results;
            
            setDeepResearchResultsByMessage(prev => ({
              ...prev,
              [messageId]: currentSearchResults
            }));
            
            setShowDeepResearchProgress(false);
          } else {
            // Standard Search Mode
            const searchResponse = await searchService.searchWeb(query, 8);
            currentSearchResults = searchResponse.results;
            
            setSearchResultsByMessage(prev => ({
              ...prev,
              [messageId]: currentSearchResults
            }));
          }
          
          console.log('✅ Search completed, found', currentSearchResults.length, 'results');
          
          // Auto-scan content for search results
          currentSearchResults.forEach(async (result) => {
            const scanResult = await searchService.scanContent(result.url);
            
            if (deepResearchEnabled) {
              setDeepResearchResultsByMessage(prev => ({
                ...prev,
                [messageId]: prev[messageId]?.map(r => 
                  r.id === result.id 
                    ? { ...r, content: scanResult.content, scanStatus: scanResult.scanStatus }
                    : r
                ) || []
              }));
            } else {
              setSearchResultsByMessage(prev => ({
                ...prev,
                [messageId]: prev[messageId]?.map(r => 
                  r.id === result.id 
                    ? { ...r, content: scanResult.content, scanStatus: scanResult.scanStatus }
                    : r
                ) || []
              }));
            }
          });
        }
        
        // Add streaming assistant message
        const assistantId = (Date.now() + 1).toString();
        const assistantMessage = {
          id: assistantId,
          type: 'assistant' as const,
          content: '',
          timestamp: new Date(),
          isStreaming: true
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        let currentContent = '';
        
        // Generate reasoning if enabled
        if (reasonEnabled) {
          try {
            const reasoning = await geminiService.generateReasoning(query, currentSearchResults);
            setReasoningByMessage(prev => ({
              ...prev,
              [messageId]: reasoning.text
            }));
          } catch (error) {
            console.error('Error generating reasoning:', error);
          }
        }
        
        // Use Gemini service for streaming response
        console.log('🤖 Generating AI response with context...');
        const response = await geminiService.generateStreamingResponse(
          query,
          deepResearchEnabled ? 'deep-research' : searchMode,
          messages.slice(-10).map(msg => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content
          })),
          (chunk: string) => {
            currentContent += chunk;
            setMessages(prev => prev.map(msg => 
              msg.id === assistantId 
                ? { ...msg, content: currentContent, isStreaming: true }
                : msg
            ));
          },
          currentSearchResults.filter(r => r.scanStatus === 'completed'),
          deepResearchEnabled,
          reasonEnabled,
          undefined,
          abortController.signal,
          isVoiceInput
        );
        
        // Final update
        setMessages(prev => prev.map(msg => 
          msg.id === assistantId 
            ? { ...msg, content: response.text, isStreaming: false }
            : msg
        ));
        
        // Auto-scroll to bottom after response
        scrollToBottom();
        setIsAssistantStreaming(false);
        setCurrentStreamController(null);
        
        console.log('✅ AI response completed');
        
      } catch (error: any) {
        console.error('Error sending message:', error);
        const errorMessage = {
          id: (Date.now() + 2).toString(),
          type: 'assistant' as const,
          content: (error as Error).message || "Sorry, something went wrong. Please try again.",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
        setIsAssistantStreaming(false);
        setCurrentStreamController(null);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {messages.length > 0 ? (
        <>
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-3xl mx-auto space-y-6">
              
              {messages.map((message) => (
                <div key={message.id} className="space-y-4">
                  {/* User Message */}
                  {message.type === 'user' && (
                    <div className="flex gap-4 justify-end">
                      <div className="max-w-2xl p-4 rounded-2xl bg-blue-600 text-white ml-12">
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                        <span className="text-gray-600 font-bold text-sm">U</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Search Results for this message */}
                  {message.type === 'user' && !deepResearchResultsByMessage[message.id] && searchResultsByMessage[message.id] && searchResultsByMessage[message.id].length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4 border mx-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <Search className="w-4 h-4" />
                        Web Search Results ({searchResultsByMessage[message.id].length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {searchResultsByMessage[message.id].slice(0, 6).map((result) => (
                          <div key={result.id} className="bg-white rounded-lg p-3 border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-5 h-5 mt-0.5">
                                <img
                                  src={result.favicon || `https://www.google.com/s2/favicons?domain=${result.domain}&sz=20`}
                                  alt=""
                                  className="w-full h-full rounded"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = `https://www.google.com/s2/favicons?domain=${result.domain}&sz=20`;
                                  }}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                                  {result.title}
                                </h4>
                                <p className="text-xs text-blue-600 mb-1 font-medium">{result.domain}</p>
                                <p className="text-xs text-gray-600 line-clamp-2">{result.snippet}</p>
                                {result.scanStatus === 'completed' && result.content && (
                                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-700 line-clamp-2">
                                    {result.content}
                                  </div>
                                )}
                              </div>
                              <a
                                href={result.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-shrink-0 text-gray-400 hover:text-blue-600 transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Progress Bar for Deep Research */}
                  {message.type === 'user' && showDeepResearchProgress && messages[messages.length - 1]?.id === message.id && (
                    <div className="mx-4">
                      <ProgressBar 
                        progress={deepResearchProgress}
                        currentTask={deepResearchTask}
                        isVisible={showDeepResearchProgress}
                      />
                    </div>
                  )}
                  
                  {message.type === 'user' && reasoningByMessage[message.id] && (
                    <div className="mx-4">
                      <ReasoningCard
                        reasoning={reasoningByMessage[message.id]}
                        isVisible={true}
                        isStreaming={false}
                      />
                    </div>
                  )}
                  
                  {/* Deep Research Results */}
                  {message.type === 'user' && deepResearchResultsByMessage[message.id] && deepResearchResultsByMessage[message.id].length > 0 && (
                    <div className="mx-4">
                      <DeepResearchResults
                        results={deepResearchResultsByMessage[message.id]}
                        query={message.content}
                        isVisible={true}
                        aiResponse={messages.find(m => m.type === 'assistant' && parseInt(m.id) > parseInt(message.id))?.content}
                      />
                    </div>
                  )}
                  
                  {/* Assistant Message */}
                  {message.type === 'assistant' && (
                    <div className="space-y-4">
                      {/* Stream Control */}
                      {message.isStreaming && (
                        <div className="flex justify-center">
                          <StreamControl
                            isStreaming={message.isStreaming}
                            onStop={handleStopStream}
                          />
                        </div>
                      )}
                      
                      <div className="flex gap-4 justify-start">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">AI</span>
                        </div>
                        <div className="max-w-2xl p-4 rounded-2xl bg-gray-100 text-gray-900">
                          <div className="prose prose-sm max-w-none">
                            <MarkdownRenderer 
                              content={message.content} 
                              autoDirection={true}
                            />
                            {message.isStreaming && (
                              <span className="animate-pulse bg-blue-400 w-2 h-5 inline-block ml-1" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {/* Auto-scroll target */}
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          {/* Input at bottom */}
          <div className="border-t border-gray-200 p-6">
            <div className="max-w-3xl mx-auto">
              <div className="w-full bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-4">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Ask me anything..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                    className="w-full text-gray-700 text-base outline-none placeholder:text-gray-400 disabled:opacity-50"
                  />
                </div>
                
                <div className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSearchEnabled(!searchEnabled)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        searchEnabled
                          ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                          : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                      }`}
                    >
                      <Search className="w-4 h-4" />
                      <span>Search</span>
                    </button>
                    <button
                      onClick={() => setDeepResearchEnabled(!deepResearchEnabled)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        deepResearchEnabled
                          ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                          : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                      }`}
                    >
                      <BrainCircuit className="w-4 h-4" />
                      <span>Deep Research</span>
                    </button>
                    <button
                      onClick={() => setReasonEnabled(!reasonEnabled)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        reasonEnabled
                          ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                          : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                      }`}
                    >
                      <BrainCircuit className="w-4 h-4" />
                      <span>Reason</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button
                      onClick={isListening ? handleVoiceStop : handleVoiceStart}
                      className={`p-2 rounded-full transition-all duration-200 ${
                        isListening
                          ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
                        <Mic className="w-5 h-5" />
                      )}
                    </motion.button>
                    <motion.button
                      onClick={handleToggleVoiceMode}
                      className={`p-2 rounded-full transition-all duration-200 ${
                        isVoiceMode
                          ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title={isVoiceMode ? 'Voice responses ON - Click to disable' : 'Voice responses OFF - Click to enable'}
                    >
                      {isVoiceMode ? (
                        <motion.div
                          animate={isSpeaking ? { scale: [1, 1.2, 1] } : {}}
                          transition={{ repeat: Infinity, duration: 0.8 }}
                        >
                          <Volume2 className="w-5 h-5" />
                        </motion.div>
                      ) : (
                        <VolumeX className="w-5 h-5" />
                      )}
                    </motion.button>
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isLoading}
                      className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                        inputValue.trim() && !isLoading
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Welcome Screen */
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
            {/* 3D Voice Assistant */}
            {(showVoiceAssistant || isListening || isSpeaking) && (
              <div className="mb-8">
                <VoiceAssistant3D
                  isListening={isListening}
                  isSpeaking={isSpeaking}
                  isVoiceMode={isVoiceMode}
                  onToggleVoiceMode={handleToggleVoiceMode}
                  className="w-48 h-48"
                />
              </div>
            )}
            
            {/* Logo with animated gradient */}
            <div className={`w-20 h-20 relative ${(isVoiceMode || isListening || isSpeaking) ? 'mb-4' : 'mb-8'}`}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 200 200"
                width="100%"
                height="100%"
                className="w-full h-full"
              >
                <g clipPath="url(#cs_clip_1_ellipse-12)">
                  <mask
                    id="cs_mask_1_ellipse-12"
                    style={{ maskType: "alpha" }}
                    width="200"
                    height="200"
                    x="0"
                    y="0"
                    maskUnits="userSpaceOnUse"
                  >
                    <path
                      fill="#fff"
                      fillRule="evenodd"
                      d="M100 150c27.614 0 50-22.386 50-50s-22.386-50-50-50-50 22.386-50 50 22.386 50 50 50zm0 50c55.228 0 100-44.772 100-100S155.228 0 100 0 0 44.772 0 100s44.772 100 100 100z"
                      clipRule="evenodd"
                    ></path>
                  </mask>
                  <g mask="url(#cs_mask_1_ellipse-12)">
                    <path fill="#fff" d="M200 0H0v200h200V0z"></path>
                    <path
                      fill="#0066FF"
                      fillOpacity="0.33"
                      d="M200 0H0v200h200V0z"
                    ></path>
                    <g
                      filter="url(#filter0_f_844_2811)"
                      className="animate-gradient"
                    >
                      <path fill="#0066FF" d="M110 32H18v68h92V32z"></path>
                      <path fill="#0044FF" d="M188-24H15v98h173v-98z"></path>
                      <path fill="#0099FF" d="M175 70H5v156h170V70z"></path>
                      <path fill="#00CCFF" d="M230 51H100v103h130V51z"></path>
                    </g>
                  </g>
                </g>
                <defs>
                  <filter
                    id="filter0_f_844_2811"
                    width="385"
                    height="410"
                    x="-75"
                    y="-104"
                    colorInterpolationFilters="sRGB"
                    filterUnits="userSpaceOnUse"
                  >
                    <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
                    <feBlend
                      in="SourceGraphic"
                      in2="BackgroundImageFix"
                      result="shape"
                    ></feBlend>
                    <feGaussianBlur
                      result="effect1_foregroundBlur_844_2811"
                      stdDeviation="40"
                    ></feGaussianBlur>
                  </filter>
                  <clipPath id="cs_clip_1_ellipse-12">
                    <path fill="#fff" d="M0 0H200V200H0z"></path>
                  </clipPath>
                </defs>
                <g
                  style={{ mixBlendMode: "overlay" }}
                  mask="url(#cs_mask_1_ellipse-12)"
                >
                  <path
                    fill="gray"
                    stroke="transparent"
                    d="M200 0H0v200h200V0z"
                    filter="url(#cs_noise_1_ellipse-12)"
                  ></path>
                </g>
                <defs>
                  <filter
                    id="cs_noise_1_ellipse-12"
                    width="100%"
                    height="100%"
                    x="0%"
                    y="0%"
                    filterUnits="objectBoundingBox"
                  >
                    <feTurbulence
                      baseFrequency="0.6"
                      numOctaves="5"
                      result="out1"
                      seed="4"
                    ></feTurbulence>
                    <feComposite
                      in="out1"
                      in2="SourceGraphic"
                      operator="in"
                      result="out2"
                    ></feComposite>
                    <feBlend
                      in="SourceGraphic"
                      in2="out2"
                      mode="overlay"
                      result="out3"
                    ></feBlend>
                  </filter>
                </defs>
              </svg>
            </div>

            {/* Welcome message */}
            <div className="mb-10 text-center">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center"
              >
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400 mb-2">
                  Ready to assist you
                </h1>
                <p className="text-gray-500 max-w-md">
                  Ask me anything or try one of the suggestions below
                </p>
              </motion.div>
            </div>

            {/* Input area with integrated functions and file upload */}
            <div className="w-full bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-4">
              <div className="p-4">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Ask me anything..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  className="w-full text-gray-700 text-base outline-none placeholder:text-gray-400"
                />
              </div>

              {/* Uploaded files */}
              {uploadedFiles.length > 0 && (
                <div className="px-4 pb-3">
                  <div className="flex flex-wrap gap-2">
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-gray-50 py-1 px-2 rounded-md border border-gray-200"
                      >
                        <FileText className="w-3 h-3 text-blue-600" />
                        <span className="text-xs text-gray-700">{file}</span>
                        <button
                          onClick={() =>
                            setUploadedFiles((prev) =>
                              prev.filter((_, i) => i !== index)
                            )
                          }
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Search, Deep Research, Reason functions and actions */}
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSearchEnabled(!searchEnabled)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      searchEnabled
                        ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                        : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                    }`}
                  >
                    <Search className="w-4 h-4" />
                    <span>Search</span>
                  </button>
                  <button
                    onClick={() => setDeepResearchEnabled(!deepResearchEnabled)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      deepResearchEnabled
                        ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                        : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                    }`}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className={
                        deepResearchEnabled ? "text-blue-600" : "text-gray-400"
                      }
                    >
                      <circle
                        cx="8"
                        cy="8"
                        r="7"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <circle cx="8" cy="8" r="3" fill="currentColor" />
                    </svg>
                    <span>Deep Research</span>
                  </button>
                  <button
                    onClick={() => setReasonEnabled(!reasonEnabled)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      reasonEnabled
                        ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                        : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                    }`}
                  >
                    <BrainCircuit
                      className={`w-4 h-4 ${
                        reasonEnabled ? "text-blue-600" : "text-gray-400"
                      }`}
                    />
                    <span>Reason</span>
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={isListening ? handleVoiceStop : handleVoiceStart}
                    className={`p-2 rounded-full transition-all duration-200 ${
                      isListening
                        ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
                      <Mic className="w-5 h-5" />
                    )}
                  </motion.button>
                  <motion.button
                    onClick={handleToggleVoiceMode}
                    className={`p-2 rounded-full transition-all duration-200 ${
                      isVoiceMode
                        ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title={isVoiceMode ? 'Voice responses ON - Click to disable' : 'Voice responses OFF - Click to enable'}
                  >
                    {isVoiceMode ? (
                      <motion.div
                        animate={isSpeaking ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                      >
                        <Volume2 className="w-5 h-5" />
                      </motion.div>
                    ) : (
                      <VolumeX className="w-5 h-5" />
                    )}
                  </motion.button>
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                      inputValue.trim() && !isLoading
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Upload files */}
              <div className="px-4 py-2 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <button
                    onClick={handleUploadFile}
                    className="flex items-center gap-2 text-gray-600 text-sm hover:text-gray-900 transition-colors"
                  >
                    {showUploadAnimation ? (
                      <motion.div
                        className="flex space-x-1"
                        initial="hidden"
                        animate="visible"
                        variants={{
                          hidden: {},
                          visible: {
                            transition: {
                              staggerChildren: 0.1,
                            },
                          },
                        }}
                      >
                        {[...Array(3)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="w-1.5 h-1.5 bg-blue-600 rounded-full"
                            variants={{
                              hidden: { opacity: 0, y: 5 },
                              visible: {
                                opacity: 1,
                                y: 0,
                                transition: {
                                  duration: 0.4,
                                  repeat: Infinity,
                                  repeatType: "mirror",
                                  delay: i * 0.1,
                                },
                              },
                            }}
                          />
                        ))}
                      </motion.div>
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    <span>Upload Files</span>
                  </button>
                  
                  {/* Voice Status Indicator */}
                  {(isListening || transcript) && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 text-xs text-blue-600"
                    >
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="w-2 h-2 bg-red-500 rounded-full"
                      />
                      <span>
                        {isListening ? 'Listening...' : transcript ? `"${transcript.slice(0, 30)}..."` : ''}
                      </span>
                    </motion.div>
                  )}
                  
                  {/* Voice Mode Status */}
                  {isVoiceMode && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 text-xs text-blue-600"
                    >
                      <motion.div
                        animate={isSpeaking ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                        className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-green-500' : 'bg-blue-500'}`}
                      />
                      <span>
                        {isSpeaking ? 'AI Speaking...' : 'Voice Mode ON'}
                      </span>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            {/* Command categories */}
            <div className="w-full grid grid-cols-3 gap-4 mb-4">
              <CommandButton
                icon={<BookOpen className="w-5 h-5" />}
                label="Learn"
                isActive={activeCommandCategory === "learn"}
                onClick={() =>
                  setActiveCommandCategory(
                    activeCommandCategory === "learn" ? null : "learn"
                  )
                }
              />
              <CommandButton
                icon={<Code className="w-5 h-5" />}
                label="Code"
                isActive={activeCommandCategory === "code"}
                onClick={() =>
                  setActiveCommandCategory(
                    activeCommandCategory === "code" ? null : "code"
                  )
                }
              />
              <CommandButton
                icon={<PenTool className="w-5 h-5" />}
                label="Write"
                isActive={activeCommandCategory === "write"}
                onClick={() =>
                  setActiveCommandCategory(
                    activeCommandCategory === "write" ? null : "write"
                  )
                }
              />
            </div>

            {/* Command suggestions */}
            <AnimatePresence>
              {activeCommandCategory && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="w-full mb-6 overflow-hidden"
                >
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-3 border-b border-gray-100">
                      <h3 className="text-sm font-medium text-gray-700">
                        {activeCommandCategory === "learn"
                          ? "Learning suggestions"
                          : activeCommandCategory === "code"
                          ? "Coding suggestions"
                          : "Writing suggestions"}
                      </h3>
                    </div>
                    <ul className="divide-y divide-gray-100">
                      {commandSuggestions[
                        activeCommandCategory as keyof typeof commandSuggestions
                      ].map((suggestion, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.03 }}
                          onClick={() => handleCommandSelect(suggestion)}
                          className="p-3 hover:bg-gray-50 cursor-pointer transition-colors duration-75"
                        >
                          <div className="flex items-center gap-3">
                            {activeCommandCategory === "learn" ? (
                              <BookOpen className="w-4 h-4 text-blue-600" />
                            ) : activeCommandCategory === "code" ? (
                              <Code className="w-4 h-4 text-blue-600" />
                            ) : (
                              <PenTool className="w-4 h-4 text-blue-600" />
                            )}
                            <span className="text-sm text-gray-700">
                              {suggestion}
                            </span>
                          </div>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}

interface CommandButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function CommandButton({ icon, label, isActive, onClick }: CommandButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all ${
        isActive
          ? "bg-blue-50 border-blue-200 shadow-sm"
          : "bg-white border-gray-200 hover:border-gray-300"
      }`}
    >
      <div className={`${isActive ? "text-blue-600" : "text-gray-500"}`}>
        {icon}
      </div>
      <span
        className={`text-sm font-medium ${
          isActive ? "text-blue-700" : "text-gray-700"
        }`}
      >
        {label}
      </span>
    </motion.button>
  );
}
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';
import { getTextDirection, detectMixedLanguageContent } from '../../utils/languageDetection';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  autoDirection?: boolean;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ 
  content, 
  className = '',
  autoDirection = true
}) => {
  // Detect text direction for the entire content
  const textDirection = autoDirection ? getTextDirection(content) : 'ltr';
  const mixedContent = autoDirection ? detectMixedLanguageContent(content) : null;
  
  // Apply direction-specific styles
  const directionClasses = textDirection === 'rtl' 
    ? 'text-right rtl:text-right' 
    : 'text-left';

  return (
    <div 
      className={`markdown-content ${directionClasses} ${className}`}
      dir={textDirection}
      style={{ 
        fontFamily: textDirection === 'rtl' 
          ? '"Noto Sans Arabic", "Cairo", "Amiri", system-ui, sans-serif'
          : 'inherit'
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // Headers
          h1: ({ children }) => {
            const headerText = String(children);
            const headerDirection = autoDirection ? getTextDirection(headerText) : textDirection;
            return (
            <h1 
              className={`text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2 ${
                headerDirection === 'rtl' ? 'text-right' : 'text-left'
              }`}
              dir={headerDirection}
            >
              {children}
            </h1>
            );
          },
          h2: ({ children }) => {
            const headerText = String(children);
            const headerDirection = autoDirection ? getTextDirection(headerText) : textDirection;
            return (
            <h2 
              className={`text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100 mt-6 ${
                headerDirection === 'rtl' ? 'text-right' : 'text-left'
              }`}
              dir={headerDirection}
            >
              {children}
            </h2>
            );
          },
          h3: ({ children }) => {
            const headerText = String(children);
            const headerDirection = autoDirection ? getTextDirection(headerText) : textDirection;
            return (
            <h3 
              className={`text-lg font-medium mb-2 text-gray-900 dark:text-gray-100 mt-4 ${
                headerDirection === 'rtl' ? 'text-right' : 'text-left'
              }`}
              dir={headerDirection}
            >
              {children}
            </h3>
            );
          },
          h4: ({ children }) => {
            const headerText = String(children);
            const headerDirection = autoDirection ? getTextDirection(headerText) : textDirection;
            return (
            <h4 
              className={`text-base font-medium mb-2 text-gray-900 dark:text-gray-100 mt-3 ${
                headerDirection === 'rtl' ? 'text-right' : 'text-left'
              }`}
              dir={headerDirection}
            >
              {children}
            </h4>
            );
          },
          
          // Paragraphs
          p: ({ children }) => {
            const paragraphText = String(children);
            const paragraphDirection = autoDirection ? getTextDirection(paragraphText) : textDirection;
            return (
            <p 
              className={`mb-4 text-gray-700 dark:text-gray-300 leading-relaxed ${
                paragraphDirection === 'rtl' ? 'text-right' : 'text-left'
              }`}
              dir={paragraphDirection}
            >
              {children}
            </p>
            );
          },
          
          // Lists
          ul: ({ children }) => (
            <ul className={`mb-4 space-y-2 text-gray-700 dark:text-gray-300 ${
              textDirection === 'rtl' ? 'mr-6' : 'ml-6'
            }`}>
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className={`mb-4 space-y-2 text-gray-700 dark:text-gray-300 list-decimal ${
              textDirection === 'rtl' ? 'list-inside mr-6' : 'list-inside ml-6'
            }`}>
              {children}
            </ol>
          ),
          li: ({ children }) => {
            const listText = String(children);
            const listDirection = autoDirection ? getTextDirection(listText) : textDirection;
            return (
            <li className={`flex items-start ${listDirection === 'rtl' ? 'flex-row-reverse' : ''}`}>
              <span className={`w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0 ${
                listDirection === 'rtl' ? 'ml-3' : 'mr-3'
              }`}></span>
              <span>{children}</span>
            </li>
            );
          },
          
          // Code
          code: ({ inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <pre className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4 overflow-x-auto">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            ) : (
              <code 
                className="bg-gray-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400 px-2 py-1 rounded text-sm font-mono" 
                {...props}
              >
                {children}
              </code>
            );
          },
          
          // Links
          a: ({ href, children }) => (
            <a 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline font-medium transition-colors"
            >
              {children}
            </a>
          ),
          
          // Blockquotes
          blockquote: ({ children }) => {
            const quoteText = String(children);
            const quoteDirection = autoDirection ? getTextDirection(quoteText) : textDirection;
            return (
            <blockquote 
              className={`py-2 mb-4 bg-blue-50 dark:bg-blue-900/20 text-gray-700 dark:text-gray-300 italic ${
                quoteDirection === 'rtl' 
                  ? 'border-r-4 border-blue-500 pr-4 text-right' 
                  : 'border-l-4 border-blue-500 pl-4 text-left'
              }`}
              dir={quoteDirection}
            >
              {children}
            </blockquote>
            );
          },
          
          // Tables
          table: ({ children }) => (
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2 text-left font-semibold text-gray-900 dark:text-gray-100">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-gray-200 dark:border-gray-700 px-4 py-2 text-gray-700 dark:text-gray-300">
              {children}
            </td>
          ),
          
          // Strong (Bold) - with underline for important words
          strong: ({ children }) => (
            <strong className="font-bold text-gray-900 dark:text-gray-100 underline decoration-blue-500 decoration-2 underline-offset-2">
              {children}
            </strong>
          ),
          
          // Emphasis (Italic)
          em: ({ children }) => (
            <em className="italic text-blue-600 dark:text-blue-400 font-medium">
              {children}
            </em>
          ),
          
          // Horizontal Rule
          hr: () => (
            <hr className="my-6 border-gray-200 dark:border-gray-700" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
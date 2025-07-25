import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

if (!API_KEY) {
  console.warn('VITE_GEMINI_API_KEY not found in environment variables.');
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

// Enhanced Grok 3 personality prompt with context awareness
const PROFESSIONAL_SYSTEM_PROMPT = `You are a professional AI research assistant with expertise across multiple domains. Your responses should be comprehensive, detailed, and authoritative.

CRITICAL INSTRUCTIONS:
1. LANGUAGE MATCHING: ALWAYS respond in the SAME LANGUAGE as the user's question. Arabic questions = Arabic responses. English questions = English responses.

2. RESPONSE LENGTH ADAPTATION:
   - Simple questions: Comprehensive 2-3 paragraph responses with detailed explanations
   - Medium complexity: 4-5 paragraphs with examples, context, and analysis
   - Complex topics: Extensive multi-section responses with thorough analysis and insights

3. PROFESSIONAL TONE:
   - Serious, authoritative, and informative
   - Use formal language and complete sentences
   - Provide evidence-based information
   - Include relevant statistics, facts, and expert insights
   - Make analytical observations and connections

4. WEB SEARCH INTEGRATION:
   - ALWAYS reference search results by website name and domain
   - Synthesize information from ALL provided sources
   - Cite specific domains and assess their credibility
   - Use search data to provide comprehensive, current information
   - Quote relevant statistics and findings from sources

5. CONVERSATION CONTEXT:
   - Reference previous messages when relevant
   - Build upon earlier topics
   - Maintain conversation flow and continuity

6. ARABIC RESPONSES:
   - Use natural, conversational Arabic
   - Include appropriate Arabic expressions
   - Match the user's dialect when possible
   - Maintain professional tone in Arabic responses

7. MARKDOWN FORMATTING:
   - Use **bold** for key concepts and important terms
   - Use ## for main sections and ### for subsections
   - Use bullet points for lists and key findings
   - Use > for important quotes from sources
   - Structure responses with clear headings and organization

Response format should be comprehensive, well-structured, and professionally written with extensive use of source material.`;

export interface GeminiResponse {
  text: string;
  sources?: Array<{
    title: string;
    url: string;
    snippet: string;
  }>;
}

export class GeminiService {
  private model: any;

  constructor() {
    if (genAI) {
      this.model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash-exp",
        systemInstruction: PROFESSIONAL_SYSTEM_PROMPT,
        generationConfig: {
          temperature: 0.3,
          topK: 20,
          topP: 0.8,
          maxOutputTokens: 4096,
        }
      });
      console.log('✅ Gemini model initialized successfully');
    } else {
      console.log('❌ Gemini model not initialized - API key missing');
    }
  }

  async generateStreamingResponse(
    query: string,
    searchMode: string = 'web',
    conversationHistory: Array<{role: string, content: string}> = [],
    onChunk: (chunk: string) => void,
    searchResults: Array<{title: string, url: string, snippet: string, content?: string}> = [],
    isDeepResearch: boolean = false,
    isReasoning: boolean = false,
    onReasoningChunk?: (chunk: string) => void,
    abortSignal?: AbortSignal,
    isVoiceInput: boolean = false
  ): Promise<GeminiResponse> {
    console.log('🤖 Generating AI response for:', query);
    console.log('🎤 Voice input mode:', isVoiceInput);
    
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
 

    if (!this.model) {
      console.error('❌ Gemini model not available');
      throw new Error('Gemini model initialization failed');
    }

    try {
      // Build comprehensive context prompt
      const contextPrompt = this.buildContextPrompt(query, searchMode, conversationHistory, searchResults, isDeepResearch, isVoiceInput);
      console.log('📝 Context prompt built, length:', contextPrompt.length);
      
      // Get the complete response from Gemini
      const result = await this.model.generateContent(contextPrompt);
      const response = await result.response;
      const fullText = response.text();
      
      console.log('✅ Got Gemini response, length:', fullText.length);
      
      // Simulate streaming by breaking response into words
      const words = fullText.split(' ');
      for (let i = 0; i < words.length; i++) {
        const chunk = (i === 0 ? '' : ' ') + words[i];
        onChunk(chunk);
        // Realistic typing delay
        await new Promise(resolve => setTimeout(resolve, 20 + Math.random() * 30));
      }

      console.log('✅ Streaming simulation completed');
      return {
        text: fullText,
        sources: this.extractSourcesFromSearchResults(searchResults)
      };
    } catch (error) {
      console.error('❌ Gemini API error:', error);
      throw new Error(`AI response failed: ${error.message}`);
    }
  }

  async generateReasoning(
    query: string,
    searchResults: Array<{title: string, url: string, snippet: string, content?: string}> = []
  ): Promise<GeminiResponse> {
    console.log('🧠 Generating reasoning for:', query);
    
    if (!this.model) {
      throw new Error('Gemini model not available');
    }

    try {
      const reasoningPrompt = this.buildReasoningPrompt(query, searchResults);
      const result = await this.model.generateContent(reasoningPrompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('✅ Reasoning generated, length:', text.length);
      
      return {
        text,
        sources: this.extractSourcesFromSearchResults(searchResults)
      };
    } catch (error) {
      console.error('❌ Reasoning generation error:', error);
      throw new Error(`Reasoning generation failed: ${error.message}`);
    }
  }

  private buildContextPrompt(
    query: string, 
    searchMode: string, 
    conversationHistory: Array<{role: string, content: string}>,
    searchResults: Array<{title: string, url: string, snippet: string, content?: string}> = [],
    isDeepResearch: boolean = false,
    isVoiceInput: boolean = false
  ): string {
    // Detect user language
    const isArabic = /[\u0600-\u06FF]/.test(query);
    const language = isArabic ? 'Arabic' : 'English';
    
    // Analyze query complexity for response length guidance
    const complexity = this.analyzeQueryComplexity(query);
    
    let contextPrompt = `CRITICAL: Respond in ${language} language only!\n\n`;
    contextPrompt += `Query Complexity: ${complexity}\n`;
    contextPrompt += `Search Mode: ${searchMode.toUpperCase()}\n\n`;
    contextPrompt += `Research Type: ${isDeepResearch ? 'DEEP RESEARCH' : 'STANDARD SEARCH'}\n`;
    contextPrompt += `Input Method: ${isVoiceInput ? 'VOICE INPUT' : 'TEXT INPUT'}\n\n`;

    // Add response length guidance based on complexity
    if (isDeepResearch) {
      contextPrompt += `DEEP RESEARCH INSTRUCTIONS: 
      - Generate a COMPREHENSIVE 5000+ word research document in ${language}
      - Use ALL ${searchResults.length} sources extensively with detailed citations
      - Structure with proper markdown formatting (# ## ### #### for headers)
      - Include multiple detailed sections with subsections
      - Provide extensive analysis, statistics, expert quotes, and insights
      - Reference specific websites, studies, and data points from sources
      - Create a thorough, academic-level research paper
      - Use proper markdown formatting throughout (bold, italic, lists, quotes)
      - Include introduction, multiple main sections, subsections, and conclusion
      - Ensure each section is detailed and comprehensive (500-800 words per section)
      - Cite sources throughout using website names and specific data
      - Make it publication-ready quality research\n\n`;
    } else if (isVoiceInput) {
      contextPrompt += `VOICE INPUT INSTRUCTIONS:
      - Provide EXACTLY 3 SHORT sentences in ${language}
      - Each sentence must be SIMPLE and CLEAR
      - NO complex explanations, bullet points, lists, or formatting
      - Use conversational tone perfect for audio listening
      - Answer directly and concisely
      - Avoid technical jargon and complex terms
      - MAXIMUM 3 sentences - no more, no less\n\n`;
    } else if (complexity === 'simple') {
      contextPrompt += `Instructions: Provide a COMPREHENSIVE response (2-3 detailed paragraphs) in ${language} with professional tone and thorough explanations.\n\n`;
    } else if (complexity === 'medium') {
      contextPrompt += `Instructions: Provide a DETAILED response (4-5 paragraphs) in ${language} with professional analysis, examples, and comprehensive coverage.\n\n`;
    } else {
      contextPrompt += `Instructions: Provide an EXTENSIVE multi-section response in ${language} with professional analysis, detailed insights, and comprehensive coverage.\n\n`;
    }

    // Add search results context if available
    if (searchResults.length > 0) {
      contextPrompt += `COMPREHENSIVE SOURCE DATABASE (${searchResults.length} sources - MUST use ALL extensively):\n`;
      searchResults.forEach((result, index) => {
        contextPrompt += `${index + 1}. Website: ${result.title}\n`;
        contextPrompt += `   URL: ${result.url}\n`;
        contextPrompt += `   Domain: ${this.extractDomain(result.url)}\n`;
        contextPrompt += `   Snippet: ${result.snippet}\n`;
        if (result.content) {
          contextPrompt += `   Content: ${result.content.substring(0, 300)}...\n`;
        }
        contextPrompt += "\n";
      });
      contextPrompt += `CRITICAL REQUIREMENTS:
      - Reference ALL ${searchResults.length} sources by name throughout the document
      - Quote specific data, statistics, and insights from each source
      - Synthesize information from academic, news, industry, and expert sources
      - Create comprehensive analysis using ALL available information
      - Use proper markdown formatting for all content
      - Generate 5000+ words of detailed, research-quality content\n\n`;
    }

    // Add conversation history for context
    if (conversationHistory.length > 0) {
      contextPrompt += "Conversation Context (use for continuity):\n";
      conversationHistory.slice(-6).forEach(msg => {
        contextPrompt += `${msg.role}: ${msg.content.substring(0, 200)}${msg.content.length > 200 ? '...' : ''}\n`;
      });
      contextPrompt += "\n";
    }

    contextPrompt += `User Question (in ${language}): ${query}\n\n`;
    contextPrompt += `FINAL INSTRUCTIONS:
    - RESPOND IN ${language} ONLY!
    ${isVoiceInput 
      ? `- Keep response SHORT (1-2 sentences maximum)
    - Use SIMPLE, clear language
    - Make it suitable for audio listening
    - No complex formatting or lists`
      : isDeepResearch
      ? `- Generate 5000+ words of comprehensive research
    - Use proper markdown formatting throughout
    - Reference ALL sources extensively
    - Create publication-quality research document
    - Include detailed analysis, statistics, and expert insights`
      : `- Provide comprehensive, well-structured response
    - Use proper markdown formatting
    - Include relevant analysis and insights`
    }`;

    return contextPrompt;
  }
  
  private buildReasoningPrompt(
    query: string,
    searchResults: Array<{title: string, url: string, snippet: string, content?: string}> = []
  ): string {
    const isArabic = /[\u0600-\u06FF]/.test(query);
    const language = isArabic ? 'Arabic' : 'English';
    
    let reasoningPrompt = `CRITICAL: Respond in ${language} language only!\n\n`;
    reasoningPrompt += `REASONING MODE INSTRUCTIONS:
    You are an AI assistant explaining your reasoning methodology. Provide a detailed explanation of:
    
    1. **Problem Analysis**: How you understand and break down the user's question
    2. **Information Processing**: How you analyze and synthesize available information
    3. **Source Evaluation**: How you assess the credibility and relevance of sources
    4. **Logic Framework**: The logical steps you follow to reach conclusions
    5. **Quality Assurance**: How you verify and validate your responses
    6. **Limitations**: What constraints or uncertainties exist in your analysis
    
    Structure your reasoning explanation with clear markdown formatting and be transparent about your methodology.\n\n`;
    
    if (searchResults.length > 0) {
      reasoningPrompt += `Available Sources for Analysis (${searchResults.length} sources):\n`;
      searchResults.slice(0, 10).forEach((result, index) => {
        reasoningPrompt += `${index + 1}. ${result.title} (${this.extractDomain(result.url)})\n`;
        reasoningPrompt += `   Snippet: ${result.snippet.substring(0, 150)}...\n\n`;
      });
    }
    
    reasoningPrompt += `User Question: ${query}\n\n`;
    reasoningPrompt += `Please explain your reasoning methodology for approaching this question in ${language}.`;
    
    return reasoningPrompt;
  }

  private analyzeQueryComplexity(query: string): 'simple' | 'medium' | 'complex' {
    const words = query.split(' ').length;
    const hasQuestionWords = /\b(how|what|why|when|where|explain|describe|analyze|compare|discuss)\b/i.test(query);
    const hasComplexTerms = /\b(analysis|research|detailed|comprehensive|in-depth|comparison|evaluation)\b/i.test(query);
    
    if (words <= 3 && !hasQuestionWords) return 'simple';
    if (words <= 8 && !hasComplexTerms) return 'medium';
    return 'complex';
  }

  private extractSourcesFromSearchResults(searchResults: Array<{title: string, url: string, snippet: string}>): Array<{title: string, url: string, snippet: string}> {
    return searchResults.slice(0, 5).map(result => ({
      title: result.title,
      url: result.url,
      snippet: result.snippet
    }));
  }

  private extractDomain(url: string): string {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return 'unknown';
    }
  }
}

export const geminiService = new GeminiService();
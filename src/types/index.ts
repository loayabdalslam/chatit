export interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: Source[];
  isStreaming?: boolean;
}

export interface Source {
  id: string;
  title: string;
  url: string;
  snippet: string;
  domain: string;
  favicon?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export type SearchMode = 'web' | 'academic' | 'code' | 'youtube' | 'news';

export interface SearchContext {
  mode: SearchMode;
  query: string;
  followUp?: boolean;
}

export interface AppState {
  conversations: Conversation[];
  activeConversationId: string | null;
  searchMode: SearchMode;
  darkMode: boolean;
  sidebarOpen: boolean;
}
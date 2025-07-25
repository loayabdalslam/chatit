import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, Conversation, Message, SearchMode } from '../types';
import { generateId } from '../utils/helpers';

interface AppStore extends AppState {
  // Actions
  setSearchMode: (mode: SearchMode) => void;
  toggleDarkMode: () => void;
  toggleSidebar: () => void;
  createConversation: () => string;
  addMessage: (conversationId: string, message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>) => void;
  setActiveConversation: (id: string | null) => void;
  deleteConversation: (id: string) => void;
  getActiveConversation: () => Conversation | null;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Initial state
      conversations: [],
      activeConversationId: null,
      searchMode: 'web',
      darkMode: false,
      sidebarOpen: false,

      // Actions
      setSearchMode: (mode) => set({ searchMode: mode }),
      
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      createConversation: () => {
        const id = generateId();
        const newConversation: Conversation = {
          id,
          title: 'New Chat',
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        set((state) => ({
          conversations: [newConversation, ...state.conversations],
          activeConversationId: id,
        }));
        
        return id;
      },

      addMessage: (conversationId, message) => {
        console.log('Adding message to conversation:', conversationId, message);
        const newMessage: Message = {
          ...message,
          id: generateId(),
          timestamp: new Date(),
        };

        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === conversationId
              ? {
                  ...conv,
                  messages: [...conv.messages, newMessage],
                  updatedAt: new Date(),
                  title: conv.messages.length === 0 && message.type === 'user' 
                    ? message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '')
                    : conv.title,
                }
              : conv
          ),
        }));
        console.log('Message added successfully');
      },

      updateMessage: (conversationId, messageId, updates) => {
        console.log('Updating message:', conversationId, messageId, updates);
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === conversationId
              ? {
                  ...conv,
                  messages: conv.messages.map((msg) =>
                    msg.id === messageId ? { ...msg, ...updates } : msg
                  ),
                  updatedAt: new Date(),
                }
              : conv
          ),
        }));
      },

      setActiveConversation: (id) => set({ activeConversationId: id }),

      deleteConversation: (id) => {
        set((state) => ({
          conversations: state.conversations.filter((conv) => conv.id !== id),
          activeConversationId: state.activeConversationId === id ? null : state.activeConversationId,
        }));
      },

      getActiveConversation: () => {
        const state = get();
        return state.conversations.find((conv) => conv.id === state.activeConversationId) || null;
      },
    }),
    {
      name: 'perplexity-store',
      partialize: (state) => ({
        conversations: state.conversations,
        activeConversationId: state.activeConversationId,
        searchMode: state.searchMode,
        darkMode: state.darkMode,
      }),
      deserialize: (str) => {
        const parsed = JSON.parse(str);
        if (parsed.state && parsed.state.conversations) {
          parsed.state.conversations = parsed.state.conversations.map((conv: any) => ({
            ...conv,
            createdAt: conv.createdAt ? new Date(conv.createdAt) : new Date(),
            updatedAt: conv.updatedAt ? new Date(conv.updatedAt) : new Date(),
            messages: conv.messages.map((msg: any) => ({
              ...msg,
              timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
            })),
          }));
        }
        return parsed;
      },
    }
  )
);
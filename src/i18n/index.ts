import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Navigation
      nav: {
        toggleLanguage: 'العربية',
        toggleTheme: 'Toggle Theme',
      },
      
      // Main Interface
      interface: {
        title: 'Ready to assist you',
        subtitle: 'Ask me anything or try one of the suggestions below',
        placeholder: 'Ask me anything...',
        send: 'Send',
        uploadFiles: 'Upload Files',
      },
      
      // Functions
      functions: {
        search: 'Search',
        deepResearch: 'Deep Research',
        reason: 'Reason',
      },
      
      // Command Categories
      commands: {
        learn: 'Learn',
        code: 'Code',
        write: 'Write',
        learnSuggestions: 'Learning suggestions',
        codeSuggestions: 'Coding suggestions',
        writeSuggestions: 'Writing suggestions',
      },
      
      // Command Suggestions
      suggestions: {
        learn: [
          'Explain the Big Bang theory',
          'How does photosynthesis work?',
          'What are black holes?',
          'Explain quantum computing',
          'How does the human brain work?',
        ],
        code: [
          'Create a React component for a todo list',
          'Write a Python function to sort a list',
          'How to implement authentication in Next.js',
          'Explain async/await in JavaScript',
          'Create a CSS animation for a button',
        ],
        write: [
          'Write a professional email to a client',
          'Create a product description for a smartphone',
          'Draft a blog post about AI',
          'Write a creative story about space exploration',
          'Create a social media post about sustainability',
        ],
      },
      
      // Referenced Tabs
      tabs: {
        title: 'Referenced Sources',
        status: {
          pending: 'Pending',
          scanning: 'Scanning...',
          completed: 'Scanned',
          error: 'Error',
        },
      },
      
      // Search
      search: {
        searching: 'Searching...',
        results: 'Found {{count}} results in {{time}}ms',
        noResults: 'No results found',
        error: 'Search failed. Please try again.',
      },
      
      // Messages
      messages: {
        thinking: 'Thinking...',
        error: 'Sorry, something went wrong. Please try again.',
        welcome: 'Hello! How can I help you today?',
      },
    },
  },
  ar: {
    translation: {
      // Navigation
      nav: {
        toggleLanguage: 'English',
        toggleTheme: 'تبديل المظهر',
      },
      
      // Main Interface
      interface: {
        title: 'مستعد لمساعدتك',
        subtitle: 'اسألني أي شيء أو جرب إحدى الاقتراحات أدناه',
        placeholder: 'اسألني أي شيء...',
        send: 'إرسال',
        uploadFiles: 'رفع الملفات',
      },
      
      // Functions
      functions: {
        search: 'بحث',
        deepResearch: 'بحث متعمق',
        reason: 'تفكير',
      },
      
      // Command Categories
      commands: {
        learn: 'تعلم',
        code: 'برمجة',
        write: 'كتابة',
        learnSuggestions: 'اقتراحات التعلم',
        codeSuggestions: 'اقتراحات البرمجة',
        writeSuggestions: 'اقتراحات الكتابة',
      },
      
      // Command Suggestions
      suggestions: {
        learn: [
          'اشرح نظرية الانفجار العظيم',
          'كيف تعمل عملية التمثيل الضوئي؟',
          'ما هي الثقوب السوداء؟',
          'اشرح الحوسبة الكمية',
          'كيف يعمل الدماغ البشري؟',
        ],
        code: [
          'أنشئ مكون React لقائمة المهام',
          'اكتب دالة Python لترتيب قائمة',
          'كيفية تنفيذ المصادقة في Next.js',
          'اشرح async/await في JavaScript',
          'أنشئ رسوم متحركة CSS لزر',
        ],
        write: [
          'اكتب بريد إلكتروني مهني لعميل',
          'أنشئ وصف منتج لهاتف ذكي',
          'اكتب مقال مدونة عن الذكاء الاصطناعي',
          'اكتب قصة إبداعية عن استكشاف الفضاء',
          'أنشئ منشور وسائل التواصل الاجتماعي عن الاستدامة',
        ],
      },
      
      // Referenced Tabs
      tabs: {
        title: 'المصادر المرجعية',
        status: {
          pending: 'في الانتظار',
          scanning: 'جاري المسح...',
          completed: 'تم المسح',
          error: 'خطأ',
        },
      },
      
      // Search
      search: {
        searching: 'جاري البحث...',
        results: 'تم العثور على {{count}} نتيجة في {{time}} مللي ثانية',
        noResults: 'لم يتم العثور على نتائج',
        error: 'فشل البحث. يرجى المحاولة مرة أخرى.',
      },
      
      // Messages
      messages: {
        thinking: 'أفكر...',
        error: 'عذراً، حدث خطأ ما. يرجى المحاولة مرة أخرى.',
        welcome: 'مرحباً! كيف يمكنني مساعدتك اليوم؟',
      },
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
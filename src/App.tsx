import React, { useEffect } from 'react';
import { AIAssistantInterface } from './components/ui/ai-assistant-interface';
import { useAppStore } from './store/useAppStore';

function App() {
  const { darkMode } = useAppStore();

  // Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-white">
      <AIAssistantInterface />
    </div>
  );
}

export default App;
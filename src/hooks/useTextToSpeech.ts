import { useState, useEffect, useRef, useCallback } from 'react';

interface TextToSpeechHook {
  isSpeaking: boolean;
  isSupported: boolean;
  speak: (text: string, options?: SpeechSynthesisUtterance) => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  setSelectedVoice: (voice: SpeechSynthesisVoice | null) => void;
  error: string | null;
}

export const useTextToSpeech = (): TextToSpeechHook => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [error, setError] = useState<string | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check if speech synthesis is supported
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  useEffect(() => {
    if (!isSupported) {
      setError('Text-to-speech is not supported in this browser');
      return;
    }

    // Load available voices
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      setVoices(availableVoices);

      // Auto-select voice based on browser language (Arabic or English)
      const browserLang = navigator.language.split('-')[0];
      
      let preferredVoice;
      
      if (browserLang === 'ar') {
        // Prefer Arabic voices
        preferredVoice = availableVoices.find(voice => 
          voice.lang.startsWith('ar') && voice.name.toLowerCase().includes('google')
        ) || availableVoices.find(voice => 
          voice.lang.startsWith('ar')
        ) || availableVoices.find(voice => 
          voice.lang.includes('ar-SA') || voice.lang.includes('ar-EG')
        );
      } else {
        // Prefer English voices
        preferredVoice = availableVoices.find(voice => 
          voice.lang.startsWith('en') && voice.name.toLowerCase().includes('google')
        ) || availableVoices.find(voice => 
          voice.lang.startsWith('en')
        );
      }
      
      // Fallback to any available voice
      const finalVoice = preferredVoice || availableVoices[0];

      if (finalVoice && !selectedVoice) {
        setSelectedVoice(finalVoice);
        console.log('🔊 Auto-selected voice:', finalVoice.name, finalVoice.lang);
      }
    };

    // Load voices immediately
    loadVoices();

    // Some browsers load voices asynchronously
    speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      speechSynthesis.onvoiceschanged = null;
    };
  }, [isSupported, selectedVoice]);

  const speak = useCallback((text: string, options?: Partial<SpeechSynthesisUtterance>) => {
    if (!isSupported || !text.trim()) return;

    // Limit voice response to exactly 3 sentences
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const limitedText = sentences.slice(0, 3).join('. ') + (sentences.length > 0 ? '.' : '');
    const finalText = limitedText.trim();

    // Detect text language and select appropriate voice
    const isArabicText = /[\u0600-\u06FF]/.test(finalText);
    const textLanguage = isArabicText ? 'ar' : 'en';
    
    // Find best voice for the detected language
    const languageVoice = voices.find(voice => 
      voice.lang.startsWith(textLanguage)
    ) || selectedVoice;
    console.log('🔊 TTS: Starting to speak (3 sentences):', finalText.substring(0, 50) + '...');
    console.log('🔊 TTS: Detected language:', textLanguage);
    console.log('🔊 TTS: Using voice:', languageVoice?.name, languageVoice?.lang);
    
    // Stop any current speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(finalText);
    
    // Apply options
    if (options) {
      Object.assign(utterance, options);
    }

    // Set voice
    if (languageVoice) {
      utterance.voice = languageVoice;
      utterance.lang = languageVoice.lang;
    } else {
      // Set language manually if no specific voice found
      utterance.lang = isArabicText ? 'ar-SA' : 'en-US';
      console.log('🔊 TTS: Using default voice with lang:', utterance.lang);
    }

    // Configure utterance
    utterance.rate = options?.rate || (isArabicText ? 0.8 : 0.9); // Slower for Arabic
    utterance.pitch = options?.pitch || 1.0;
    utterance.volume = options?.volume || 1.0;

    // Event handlers
    utterance.onstart = () => {
      setIsSpeaking(true);
      setError(null);
      console.log('🔊 Text-to-speech started');
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      console.log('🔊 Text-to-speech ended');
    };

    utterance.onerror = (event) => {
      console.error('🔊 Text-to-speech error:', event.error);
      setError(`Text-to-speech error: ${event.error}`);
      setIsSpeaking(false);
    };

    utterance.onpause = () => {
      console.log('🔊 Text-to-speech paused');
    };

    utterance.onresume = () => {
      console.log('🔊 Text-to-speech resumed');
    };

    utteranceRef.current = utterance;
    
    // Ensure speech synthesis is ready
    if (speechSynthesis.paused) {
      speechSynthesis.resume();
    }
    
    speechSynthesis.speak(utterance);
    console.log('🔊 TTS: Speech queued for playback');
  }, [isSupported, selectedVoice]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  const pause = useCallback(() => {
    if (!isSupported) return;
    speechSynthesis.pause();
  }, [isSupported]);

  const resume = useCallback(() => {
    if (!isSupported) return;
    speechSynthesis.resume();
  }, [isSupported]);

  return {
    isSpeaking,
    isSupported,
    speak,
    stop,
    pause,
    resume,
    voices,
    selectedVoice,
    setSelectedVoice,
    error
  };
};
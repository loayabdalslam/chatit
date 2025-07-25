// Language detection utility for RTL/LTR text direction
export interface LanguageInfo {
  language: string;
  direction: 'rtl' | 'ltr';
  confidence: number;
}

// RTL language patterns
const RTL_PATTERNS = {
  arabic: /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/,
  hebrew: /[\u0590-\u05FF]/,
  persian: /[\u06A0-\u06EF]/,
  urdu: /[\u0600-\u06FF]/,
  syriac: /[\u0700-\u074F]/,
  thaana: /[\u0780-\u07BF]/,
  nko: /[\u07C0-\u07FF]/
};

// LTR language patterns
const LTR_PATTERNS = {
  latin: /[A-Za-z]/,
  cyrillic: /[\u0400-\u04FF]/,
  greek: /[\u0370-\u03FF]/,
  armenian: /[\u0530-\u058F]/,
  georgian: /[\u10A0-\u10FF]/,
  chinese: /[\u4E00-\u9FFF]/,
  japanese: /[\u3040-\u309F\u30A0-\u30FF]/,
  korean: /[\uAC00-\uD7AF]/,
  thai: /[\u0E00-\u0E7F]/,
  devanagari: /[\u0900-\u097F]/
};

export function detectLanguage(text: string): LanguageInfo {
  if (!text || text.trim().length === 0) {
    return { language: 'unknown', direction: 'ltr', confidence: 0 };
  }

  const cleanText = text.replace(/[^\p{L}\p{N}]/gu, '');
  const totalChars = cleanText.length;
  
  if (totalChars === 0) {
    return { language: 'unknown', direction: 'ltr', confidence: 0 };
  }

  let maxRtlCount = 0;
  let maxLtrCount = 0;
  let detectedLanguage = 'unknown';
  let maxCount = 0;

  // Check RTL languages
  Object.entries(RTL_PATTERNS).forEach(([lang, pattern]) => {
    const matches = cleanText.match(pattern);
    const count = matches ? matches.length : 0;
    maxRtlCount += count;
    
    if (count > maxCount) {
      maxCount = count;
      detectedLanguage = lang;
    }
  });

  // Check LTR languages
  Object.entries(LTR_PATTERNS).forEach(([lang, pattern]) => {
    const matches = cleanText.match(pattern);
    const count = matches ? matches.length : 0;
    maxLtrCount += count;
    
    if (count > maxCount) {
      maxCount = count;
      detectedLanguage = lang;
    }
  });

  // Determine direction based on character counts
  const rtlRatio = maxRtlCount / totalChars;
  const ltrRatio = maxLtrCount / totalChars;
  
  let direction: 'rtl' | 'ltr' = 'ltr';
  let confidence = 0;

  if (rtlRatio > ltrRatio && rtlRatio > 0.3) {
    direction = 'rtl';
    confidence = Math.min(rtlRatio * 100, 100);
  } else if (ltrRatio > 0.3) {
    direction = 'ltr';
    confidence = Math.min(ltrRatio * 100, 100);
  } else {
    // Mixed content - use majority rule with lower confidence
    direction = rtlRatio > ltrRatio ? 'rtl' : 'ltr';
    confidence = Math.max(rtlRatio, ltrRatio) * 50; // Lower confidence for mixed content
  }

  return {
    language: detectedLanguage,
    direction,
    confidence: Math.round(confidence)
  };
}

export function getTextDirection(text: string): 'rtl' | 'ltr' {
  const { direction } = detectLanguage(text);
  return direction;
}

export function isRTLLanguage(text: string): boolean {
  return getTextDirection(text) === 'rtl';
}

// Enhanced language detection for mixed content
export function detectMixedLanguageContent(text: string): {
  primaryDirection: 'rtl' | 'ltr';
  hasRTL: boolean;
  hasLTR: boolean;
  segments: Array<{ text: string; direction: 'rtl' | 'ltr' }>;
} {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const segments: Array<{ text: string; direction: 'rtl' | 'ltr' }> = [];
  
  let rtlCount = 0;
  let ltrCount = 0;

  sentences.forEach(sentence => {
    const direction = getTextDirection(sentence.trim());
    segments.push({ text: sentence.trim(), direction });
    
    if (direction === 'rtl') rtlCount++;
    else ltrCount++;
  });

  return {
    primaryDirection: rtlCount > ltrCount ? 'rtl' : 'ltr',
    hasRTL: rtlCount > 0,
    hasLTR: ltrCount > 0,
    segments
  };
}
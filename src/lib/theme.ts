// Design System and Theme Configuration for ChatIt
export const theme = {
  // Colors - Black & White theme with grays
  colors: {
    primary: {
      black: '#000000',
      white: '#ffffff',
      gray: {
        50: '#f9fafb',
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        400: '#9ca3af',
        500: '#6b7280',
        600: '#4b5563',
        700: '#374151',
        800: '#1f2937',
        900: '#111827',
      }
    },
    status: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    }
  },

  // Typography
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'monospace'],
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem',
      '7xl': '4.5rem',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    }
  },

  // Spacing
  spacing: {
    0: '0',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    32: '8rem',
  },

  // Border radius
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px',
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },

  // Transitions
  transitions: {
    fast: '150ms ease-in-out',
    normal: '300ms ease-in-out',
    slow: '500ms ease-in-out',
  },

  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  }
};

// Common component styles
export const componentStyles = {
  // Button variants
  button: {
    base: `
      inline-flex items-center justify-center font-medium transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed
    `,
    variants: {
      primary: `
        bg-black text-white border border-black
        hover:bg-gray-800 hover:border-gray-800
        focus:ring-gray-500
      `,
      secondary: `
        bg-white text-black border border-gray-300
        hover:bg-gray-50 hover:border-gray-400
        focus:ring-gray-500
      `,
      ghost: `
        bg-transparent text-black border border-transparent
        hover:bg-gray-100
        focus:ring-gray-500
      `,
      danger: `
        bg-red-600 text-white border border-red-600
        hover:bg-red-700 hover:border-red-700
        focus:ring-red-500
      `
    },
    sizes: {
      sm: 'px-3 py-1.5 text-sm rounded-md',
      md: 'px-4 py-2 text-sm rounded-md',
      lg: 'px-6 py-3 text-base rounded-md',
      xl: 'px-8 py-4 text-lg rounded-lg'
    }
  },

  // Input variants
  input: {
    base: `
      block w-full border border-gray-300 rounded-md px-3 py-2
      focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent
      disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
      transition-colors duration-200
    `,
    variants: {
      default: 'bg-white text-black',
      error: 'border-red-500 focus:ring-red-500'
    }
  },

  // Card variants
  card: {
    base: `
      bg-white border border-gray-200 rounded-lg
      transition-shadow duration-200
    `,
    variants: {
      default: 'shadow-sm hover:shadow-md',
      elevated: 'shadow-md hover:shadow-lg',
      interactive: 'shadow-sm hover:shadow-lg cursor-pointer transform hover:-translate-y-1 transition-all duration-200'
    }
  },

  // Container variants
  container: {
    base: 'mx-auto px-4 sm:px-6 lg:px-8',
    sizes: {
      sm: 'max-w-2xl',
      md: 'max-w-4xl',
      lg: 'max-w-6xl',
      xl: 'max-w-7xl',
      full: 'max-w-full'
    }
  }
};

// Animation variants for Framer Motion
export const animations = {
  fadeIn: {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: "easeOut" } 
    }
  },
  
  fadeInUp: {
    hidden: { opacity: 0, y: 60 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: "easeOut" } 
    }
  },

  stagger: {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      } 
    }
  },

  slideInLeft: {
    hidden: { opacity: 0, x: -50 },
    visible: { 
      opacity: 1, 
      x: 0, 
      transition: { duration: 0.6, ease: "easeOut" } 
    }
  },

  slideInRight: {
    hidden: { opacity: 0, x: 50 },
    visible: { 
      opacity: 1, 
      x: 0, 
      transition: { duration: 0.6, ease: "easeOut" } 
    }
  },

  scaleIn: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      transition: { duration: 0.5, ease: "easeOut" } 
    }
  }
};

// Utility functions
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

export const getButtonClasses = (
  variant: keyof typeof componentStyles.button.variants = 'primary',
  size: keyof typeof componentStyles.button.sizes = 'md'
): string => {
  return cn(
    componentStyles.button.base,
    componentStyles.button.variants[variant],
    componentStyles.button.sizes[size]
  );
};

export const getInputClasses = (
  variant: keyof typeof componentStyles.input.variants = 'default'
): string => {
  return cn(
    componentStyles.input.base,
    componentStyles.input.variants[variant]
  );
};

export const getCardClasses = (
  variant: keyof typeof componentStyles.card.variants = 'default'
): string => {
  return cn(
    componentStyles.card.base,
    componentStyles.card.variants[variant]
  );
};

export const getContainerClasses = (
  size: keyof typeof componentStyles.container.sizes = 'lg'
): string => {
  return cn(
    componentStyles.container.base,
    componentStyles.container.sizes[size]
  );
}; 
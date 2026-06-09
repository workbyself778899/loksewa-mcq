'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

/**
 * Context for managing dark mode state across the application
 * Provides theme switching functionality and persistent theme preference
 */

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * ThemeProvider component - wraps the entire app to provide dark mode context
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage on component mount
  useEffect(() => {
    setMounted(true);
    // Check localStorage for saved preference
    const savedTheme = localStorage.getItem('theme');
    // Check system preference if no saved preference
    const prefersDark =
      savedTheme === 'dark' ||
      (!savedTheme &&
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    setIsDark(prefersDark);
    // Apply theme to document
    if (prefersDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Toggle theme function
  const toggleTheme = () => {
    setIsDark(!isDark);
    // Save preference to localStorage
    localStorage.setItem('theme', !isDark ? 'dark' : 'light');
    // Update document class
    if (!isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Prevent rendering until client-side initialization is complete
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to use theme context
 * Returns current theme state and toggle function
 * Returns default values if not within ThemeProvider (e.g., during SSR)
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  
  // Return default values during SSR or if context is not available
  if (context === undefined) {
    return {
      isDark: false,
      toggleTheme: () => {},
    };
  }
  
  return context;
}

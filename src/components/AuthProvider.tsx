'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';

/**
 * Decode JWT payload without a library (client-side only).
 * Returns the parsed payload object or null if decoding fails.
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Check whether a JWT token has expired by comparing its `exp` claim
 * against the current time. Returns true if expired or unreadable.
 */
function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== 'number') return true;
  // exp is in seconds, Date.now() is in milliseconds
  return Date.now() >= payload.exp * 1000;
}

/**
 * Context for managing user authentication state
 * Stores user info, token, and provides login/logout functions
 */

interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider component - wraps the app to provide authentication context
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount — reject expired tokens immediately
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      if (isTokenExpired(savedToken)) {
        // Token already expired — clear stale session
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } else {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    }
    setIsLoading(false);
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      const data = await response.json();
      setToken(data.token);
      setUser(data.user);

      // Save to localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (email: string, password: string, fullName: string) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
      }

      const data = await response.json();
      setToken(data.token);
      setUser(data.user);

      // Save to localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  // Periodically check token expiration and auto-logout
  useEffect(() => {
    if (!token) return;

    // Immediate check
    if (isTokenExpired(token)) {
      logout();
      toast.error('Your session has expired. Please log in again.');
      return;
    }

    // Set up interval to check every 5 seconds
    const intervalId = setInterval(() => {
      if (isTokenExpired(token)) {
        logout();
        toast.error('Your session has expired. Please log in again.');
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [token, logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to use auth context
 * Provides access to authentication state and functions
 * Returns default values during SSR if not within AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  // Return default values during SSR or if context is not available
  if (context === undefined) {
    return {
      user: null,
      token: null,
      isLoading: false,
      login: async () => {},
      register: async () => {},
      logout: () => {},
      isAuthenticated: false,
    };
  }
  
  return context;
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTheme } from './ThemeProvider';
import { useAuth } from './AuthProvider';
import { FiMenu, FiX, FiMoon, FiSun } from 'react-icons/fi';

/**
 * Navbar component - displays navigation with auth links and theme toggle
 * Responsive design for mobile, tablet, and desktop
 */
export default function Navbar() {
  const { isDark, toggleTheme } = useTheme();
  const { isAuthenticated, user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu on link click
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      className={`${
        isDark ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-200'
      } border-b sticky top-0 z-50 shadow-md`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              MCQ
            </div>
            <span className="hidden sm:inline text-lg font-semibold">Platform</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className={`hover:text-blue-500 transition ${
                isDark ? 'hover:text-blue-400' : ''
              }`}
            >
              Home
            </Link>

            <Link
              href="/notes"
              className={`hover:text-blue-500 transition ${
                isDark ? 'hover:text-blue-400' : ''
              }`}
            >
              Notes
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  href="/dashboard"
                  className={`hover:text-blue-500 transition ${
                    isDark ? 'hover:text-blue-400' : ''
                  }`}
                >
                  Dashboard
                </Link>

                {user?.role === 'admin' && (
                  <Link
                    href="/admin"
                    className={`hover:text-blue-500 transition ${
                      isDark ? 'hover:text-blue-400' : ''
                    }`}
                  >
                    Admin Panel
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition ${
                isDark
                  ? 'bg-gray-800 hover:bg-gray-700'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <FiSun className="text-yellow-400 w-5 h-5" />
              ) : (
                <FiMoon className="text-gray-600 w-5 h-5" />
              )}
            </button>

            {/* Auth Links - Desktop */}
            <div className="hidden md:flex items-center space-x-3">
              {isAuthenticated ? (
                <>
                  <span className="text-sm font-medium">{user?.fullName}</span>
                  <button
                    onClick={logout}
                    className={`px-4 py-2 rounded-lg transition ${
                      isDark
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-red-500 hover:bg-red-600 text-white'
                    }`}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className={`px-4 py-2 rounded-lg transition ${
                      isDark
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className={`px-4 py-2 rounded-lg transition ${
                      isDark
                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                        : 'bg-purple-500 hover:bg-purple-600 text-white'
                    }`}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-lg transition"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <FiX className="w-6 h-6" />
              ) : (
                <FiMenu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div
            className={`md:hidden pb-4 space-y-2 ${
              isDark ? 'bg-gray-800' : 'bg-gray-50'
            }`}
          >
            <Link
              href="/"
              onClick={closeMobileMenu}
              className={`block px-4 py-2 rounded-lg transition ${
                isDark
                  ? 'hover:bg-gray-700'
                  : 'hover:bg-gray-200'
              }`}
            >
              Home
            </Link>

            <Link
              href="/notes"
              onClick={closeMobileMenu}
              className={`block px-4 py-2 rounded-lg transition ${
                isDark
                  ? 'hover:bg-gray-700'
                  : 'hover:bg-gray-200'
              }`}
            >
              Notes
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  href="/dashboard"
                  onClick={closeMobileMenu}
                  className={`block px-4 py-2 rounded-lg transition ${
                    isDark
                      ? 'hover:bg-gray-700'
                      : 'hover:bg-gray-200'
                  }`}
                >
                  Dashboard
                </Link>

                {user?.role === 'admin' && (
                  <Link
                    href="/admin"
                    onClick={closeMobileMenu}
                    className={`block px-4 py-2 rounded-lg transition ${
                      isDark
                        ? 'hover:bg-gray-700'
                        : 'hover:bg-gray-200'
                    }`}
                  >
                    Admin Panel
                  </Link>
                )}
              </>
            )}

            <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 mt-2 pt-2 space-y-2">
              {isAuthenticated ? (
                <>
                  <p className="text-sm font-medium py-2">{user?.fullName}</p>
                  <button
                    onClick={() => {
                      logout();
                      closeMobileMenu();
                    }}
                    className={`w-full px-4 py-2 rounded-lg transition text-left ${
                      isDark
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-red-500 hover:bg-red-600 text-white'
                    }`}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={closeMobileMenu}
                    className={`block px-4 py-2 rounded-lg transition text-center ${
                      isDark
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={closeMobileMenu}
                    className={`block px-4 py-2 rounded-lg transition text-center ${
                      isDark
                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                        : 'bg-purple-500 hover:bg-purple-600 text-white'
                    }`}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

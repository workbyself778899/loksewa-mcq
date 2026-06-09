'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/components/AuthProvider';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';

/**
 * Login page component
 * Allows users to log in with email and password
 * Responsive design with dark mode support
 */
export default function LoginPage() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { login, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Handle form input changes
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate inputs
      if (!formData.email || !formData.password) {
        toast.error('Please fill all fields');
        return;
      }

      // Call login function from auth context
      await login(formData.email, formData.password);
      toast.success('Login successful!');

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <div className={`w-full max-w-md rounded-lg shadow-lg p-8 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">MCQ Platform</h1>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-2`}>Sign in to your account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div>
            <label className="block text-sm font-semibold mb-2">Email Address</label>
            <div className={`flex items-center border rounded-lg px-4 py-2 transition ${isDark ? 'bg-gray-800 border-gray-700 focus-within:border-blue-500' : 'bg-gray-50 border-gray-300 focus-within:border-blue-500'}`}>
              <FiMail className={`w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="you@example.com"
                className={`flex-1 ml-2 bg-transparent outline-none ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}`}
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-semibold mb-2">Password</label>
            <div className={`flex items-center border rounded-lg px-4 py-2 transition ${isDark ? 'bg-gray-800 border-gray-700 focus-within:border-blue-500' : 'bg-gray-50 border-gray-300 focus-within:border-blue-500'}`}>
              <FiLock className={`w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className={`flex-1 ml-2 bg-transparent outline-none ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`ml-2 ${isDark ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className={`w-full py-3 rounded-lg font-semibold transition mt-6 ${
              isDark
                ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600 disabled:opacity-50 text-white'
                : 'bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500 disabled:opacity-50 text-white'
            }`}
          >
            {isSubmitting || isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div className={`flex items-center my-6 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
          <div className={`flex-1 h-px ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
          <span className="px-3 text-sm">Don't have an account?</span>
          <div className={`flex-1 h-px ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
        </div>

        {/* Sign Up Link */}
        <Link
          href="/register"
          className={`block w-full text-center py-3 rounded-lg font-semibold transition ${
            isDark
              ? 'bg-purple-600 hover:bg-purple-700 text-white'
              : 'bg-purple-500 hover:bg-purple-600 text-white'
          }`}
        >
          Create New Account
        </Link>

        {/* Footer */}
        <p className={`text-center text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'} mt-6`}>
          By signing in, you agree to our{' '}
          <a href="#" className="text-blue-500 hover:text-blue-600">
            Terms
          </a>
        </p>
      </div>
    </div>
  );
}

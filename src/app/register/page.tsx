'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/components/AuthProvider';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';

/**
 * Register page component
 * Allows new users to create an account
 * Responsive design with dark mode support and password validation
 */
export default function RegisterPage() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { register, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
   * Handle form submission with validation
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate inputs
      if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
        toast.error('Please fill all fields');
        return;
      }

      // Validate full name length
      if (formData.fullName.length < 2) {
        toast.error('Full name must be at least 2 characters');
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error('Please enter a valid email address');
        return;
      }

      // Validate password length
      if (formData.password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }

      // Check if passwords match
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }

      // Call register function from auth context
      await register(formData.email, formData.password, formData.fullName);
      toast.success('Account created successfully!');

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 sm:px-6 ${isDark ? 'text-white' : 'text-black'} lg:px-8 ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <div className={`w-full max-w-md rounded-lg shadow-lg p-8 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">MCQ Platform</h1>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-2`}>Create your account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name Input */}
          <div>
            <label className="block text-sm font-semibold mb-2">Full Name</label>
            <div className={`flex items-center border rounded-lg px-4 py-2 transition ${isDark ? 'bg-gray-800 border-gray-700 focus-within:border-blue-500' : 'bg-gray-50 border-gray-300 focus-within:border-blue-500'}`}>
              <FiUser className={`w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="John Doe"
                className={`flex-1 ml-2 bg-transparent outline-none ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}`}
              />
            </div>
          </div>

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
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Minimum 6 characters</p>
          </div>

          {/* Confirm Password Input */}
          <div>
            <label className="block text-sm font-semibold mb-2">Confirm Password</label>
            <div className={`flex items-center border rounded-lg px-4 py-2 transition ${isDark ? 'bg-gray-800 border-gray-700 focus-within:border-blue-500' : 'bg-gray-50 border-gray-300 focus-within:border-blue-500'}`}>
              <FiLock className={`w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="••••••••"
                className={`flex-1 ml-2 bg-transparent outline-none ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className={`ml-2 ${isDark ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
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
            {isSubmitting || isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Divider */}
        <div className={`flex items-center my-6 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
          <div className={`flex-1 h-px ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
          <span className="px-3 text-sm">Already have an account?</span>
          <div className={`flex-1 h-px ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
        </div>

        {/* Sign In Link */}
        <Link
          href="/login"
          className={`block w-full text-center py-3 rounded-lg font-semibold transition ${
            isDark
              ? 'bg-purple-600 hover:bg-purple-700 text-white'
              : 'bg-purple-500 hover:bg-purple-600 text-white'
          }`}
        >
          Sign In
        </Link>

        {/* Footer */}
        <p className={`text-center text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'} mt-6`}>
          By creating an account, you agree to our{' '}
          <a href="#" className="text-blue-500 hover:text-blue-600">
            Terms
          </a>
        </p>
      </div>
    </div>
  );
}

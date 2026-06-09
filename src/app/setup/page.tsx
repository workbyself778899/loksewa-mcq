'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';
import { FiArrowRight, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface SetupStatus {
  adminsCount: number;
  usersCount: number;
  needsSetup: boolean;
}

/**
 * Setup page - helps users initialize the platform
 */
export default function SetupPage() {
  const { isDark } = useTheme();
  const [status, setStatus] = useState<SetupStatus | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isSeeded, setIsSeeded] = useState(false);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [showAdminForm, setShowAdminForm] = useState(false);

  const [adminFormData, setAdminFormData] = useState({
    email: '',
    password: '',
    fullName: '',
  });

  // Check setup status
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/admin/setup');
        if (res.ok) {
          const data = await res.json();
          setStatus(data);
          if (data.needsSetup) {
            setShowAdminForm(true);
          }
        }
      } catch (error) {
        console.error('Error checking setup:', error);
      }
    };

    checkStatus();
  }, []);

  /**
   * Seed database with sample courses
   */
  const handleSeedDatabase = async () => {
    try {
      setIsSeeding(true);
      const res = await fetch('/api/seed?reset=true', {
        method: 'POST',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to seed database');
      }

      const data = await res.json();
      toast.success(`Created ${data.coursesCreated} sample courses!`);
      setIsSeeded(true);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSeeding(false);
    }
  };

  /**
   * Create admin user
   */
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!adminFormData.email || !adminFormData.password || !adminFormData.fullName) {
      toast.error('Please fill all fields');
      return;
    }

    if (adminFormData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      setIsCreatingAdmin(true);
      const res = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminFormData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create admin');
      }

      toast.success('Admin user created! Please log in.');
      setAdminFormData({ email: '', password: '', fullName: '' });
      setShowAdminForm(false);

      // Refresh status
      const statusRes = await fetch('/api/admin/setup');
      if (statusRes.ok) {
        const data = await statusRes.json();
        setStatus(data);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-gray-50'} py-12 px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Welcome to MCQ Platform</h1>
          <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Let's get your platform set up and ready to use
          </p>
        </div>

        {/* Setup Steps */}
        <div className="space-y-6 mb-12">
          {/* Step 1 */}
          <div
            className={`p-6 rounded-lg border-2 ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-2">Environment Setup</h3>
                <p className={`mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Your environment variables have been configured:
                </p>
                <ul className={`text-sm space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <li>✓ MONGODB_URI: Configured</li>
                  <li>✓ JWT_SECRET: Configured</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div
            className={`p-6 rounded-lg border-2 ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-2">Seed Sample Data</h3>
                <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Add 6 sample courses to your database so you can see the platform in action immediately.
                </p>
                <button
                  onClick={handleSeedDatabase}
                  disabled={isSeeding || isSeeded}
                  className={`px-6 py-2 rounded-lg font-semibold transition ${
                    isSeeded
                      ? isDark
                        ? 'bg-green-900 text-green-200'
                        : 'bg-green-100 text-green-700'
                      : isDark
                      ? 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50'
                      : 'bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50'
                  }`}
                >
                  {isSeeding ? 'Seeding...' : isSeeded ? '✓ Seeded' : 'Seed Database'}
                </button>
                {isSeeded && (
                  <div className="mt-3 p-3 rounded bg-green-100 text-green-700 text-sm">
                    Database seeded successfully! 6 sample courses have been created.
                  </div>
                )}
              </div>
            </div>
          </div>


        {/* Step 3 - Admin Setup */}
        <div
          className={`p-6 rounded-lg border-2 ${
            status?.needsSetup
              ? isDark ? 'bg-yellow-900/20 border-yellow-600' : 'bg-yellow-50 border-yellow-300'
              : isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">
              3
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-2">Create Admin Account</h3>
              <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {status?.adminsCount ? 'Admin account exists' : 'Create an admin account to manage the platform'}.
              </p>

              {status?.adminsCount ? (
                <div className="inline-block px-4 py-2 rounded-lg bg-green-100 text-green-700 font-semibold">
                  ✓ {status.adminsCount} admin{status.adminsCount !== 1 ? 's' : ''} configured
                </div>
              ) : showAdminForm ? (
                <form onSubmit={handleCreateAdmin} className="space-y-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={adminFormData.fullName}
                      onChange={(e) =>
                        setAdminFormData({ ...adminFormData, fullName: e.target.value })
                      }
                      className={`w-full px-4 py-2 rounded-lg border outline-none transition ${
                        isDark
                          ? 'bg-gray-900 border-gray-700 focus:border-purple-500'
                          : 'bg-white border-gray-300 focus:border-purple-500'
                      }`}
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={adminFormData.email}
                      onChange={(e) =>
                        setAdminFormData({ ...adminFormData, email: e.target.value })
                      }
                      className={`w-full px-4 py-2 rounded-lg border outline-none transition ${
                        isDark
                          ? 'bg-gray-900 border-gray-700 focus:border-purple-500'
                          : 'bg-white border-gray-300 focus:border-purple-500'
                      }`}
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      placeholder="Password (min 6 characters)"
                      value={adminFormData.password}
                      onChange={(e) =>
                        setAdminFormData({ ...adminFormData, password: e.target.value })
                      }
                      className={`w-full px-4 py-2 rounded-lg border outline-none transition ${
                        isDark
                          ? 'bg-gray-900 border-gray-700 focus:border-purple-500'
                          : 'bg-white border-gray-300 focus:border-purple-500'
                      }`}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={isCreatingAdmin}
                      className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg font-semibold transition"
                    >
                      {isCreatingAdmin ? 'Creating...' : 'Create Admin'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAdminForm(false)}
                      className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${
                        isDark
                          ? 'bg-gray-700 hover:bg-gray-600 text-white'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                      }`}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setShowAdminForm(true)}
                  className="px-6 py-2 rounded-lg font-semibold transition bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Create Admin Account
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Step 4 */}
        <div
          className={`p-6 rounded-lg border-2 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-indigo-500 text-white rounded-full flex items-center justify-center font-bold">
              4
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-2">Start Using the Platform</h3>
              <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Now you're ready! Log in as admin to manage courses and create questions.
              </p>
              <div className="flex gap-3 flex-wrap">
                <Link
                  href="/login"
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition flex items-center gap-2"
                >
                  Admin Login <FiArrowRight />
                </Link>
                <Link
                  href="/"
                  className={`px-6 py-2 rounded-lg font-semibold transition ${
                    isDark
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  }`}
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

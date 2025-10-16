'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogoIcon, EyeIcon, GoogleIcon } from '../../components/ui/icons';
import { useAuth } from '../../contexts/auth-context';

interface SignInForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

export default function SignInPage() {
  const router = useRouter();
  const { signInWithCredentials, signInWithGoogle, isLoading: authLoading } = useAuth();
  const [form, setForm] = useState<SignInForm>({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [shouldRedirectToCheckout, setShouldRedirectToCheckout] = useState(false);

  const isLoading = authLoading;

  useEffect(() => {
    // Check if user came from cart and should redirect to checkout after login
    const checkoutRedirect = localStorage.getItem('trichomes_checkout_redirect');
    if (checkoutRedirect === 'true') {
      setShouldRedirectToCheckout(true);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic form validation
    if (!form.email.trim() || !form.password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      // Use NextAuth credentials sign-in
      await signInWithCredentials(form.email, form.password);

      // Clear checkout redirect flag
      localStorage.removeItem('trichomes_checkout_redirect');

      // Redirect based on user type and context
      if (form.email.includes('admin')) {
        router.push('/admin');
      } else if (shouldRedirectToCheckout) {
        router.push('/checkout');
      } else {
        router.push('/');
      }
    } catch (err: unknown) {
      // Following CODING_RULES.md - proper error handling
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      // Following CODING_RULES.md - proper error handling
      console.error('Google sign-in failed:', error);
      setError('Google sign-in failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <LogoIcon />
            <span className="ml-2 text-2xl font-bold text-[#4CAF50]">TRICHOMES</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h1>
          <p className="text-gray-600">Sign in to your account to continue</p>
        </div>

        {/* Sign In Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={form.password}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors pr-12"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <EyeIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={form.rememberMe}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <Link
                href="/auth/forgot-password"
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading || !form.email.trim() || !form.password.trim()}
              className="w-full bg-[#38761d] text-white py-3 px-4 rounded-lg hover:bg-opacity-90 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-sm text-gray-500">or</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          {/* Sign Up Link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-green-600 hover:text-green-700 font-medium">
              Sign up
            </Link>
          </p>
        </div>

        {/* Demo Accounts */}
        <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Demo Accounts</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Admin:</span>
              <span className="font-mono text-gray-800">admin@trichomes.com</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Customer:</span>
              <span className="font-mono text-gray-800">customer@example.com</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Password:</span>
              <span className="font-mono text-gray-800">demo123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
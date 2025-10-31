'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { LogoIcon, MailIcon, CheckCircleIcon } from '@/components/ui/icons';
import Image from 'next/image';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // TODO: Implement actual password reset with tRPC
      console.log('Send password reset to:', email);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      setIsSuccess(true);
    } catch (err) {
      setError('Unable to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setIsLoading(true);
    try {
      // TODO: Resend reset email
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Resent password reset email');
    } catch (err) {
      setError('Failed to resend email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Link href="/" className="flex items-center h-full">
           <Image src="/T3.png" alt="Trichomes Logo" width={120} height={100} className="object-contain" /> 
          </Link>
           </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircleIcon />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-4">Check your email</h1>
            <p className="text-gray-600 mb-6">
              We've sent a password reset link to{' '}
              <span className="font-medium text-gray-900">{email}</span>
            </p>

            <div className="space-y-4">
              <button
                onClick={handleResendEmail}
                disabled={isLoading}
                className="w-full bg-[#38761d] text-white py-3 px-4 rounded-lg hover:bg-opacity-90 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Resending...' : 'Resend Email'}
              </button>

              <Link
                href="/auth/signin"
                className="w-full block text-center py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Back to Sign In
              </Link>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Didn't receive the email? Check your spam folder or{' '}
                <button
                  onClick={handleResendEmail}
                  className="text-green-600 hover:text-green-700 underline"
                >
                  try again
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Link href="/" className="flex items-center h-full">
           <Image src="/T3.png" alt="Trichomes Logo" width={120} height={100} className="object-contain" /> 
          </Link>
           </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Forgot password?</h1>
          <p className="text-gray-600">No worries, we'll send you reset instructions</p>
        </div>

        {/* Reset Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors text-gray-900"
                  placeholder="Enter your email address"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <MailIcon className="w-5 h-5" />
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Enter the email address associated with your account and we'll send you a link to reset your password.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email.trim()}
              className="w-full bg-[#38761d] text-white py-3 px-4 rounded-lg hover:bg-opacity-90 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending...' : 'Send Reset Instructions'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/auth/signin"
              className="text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to sign in
            </Link>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Still having trouble?{' '}
            <Link href="/contact" className="text-green-600 hover:text-green-700 underline">
              Contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
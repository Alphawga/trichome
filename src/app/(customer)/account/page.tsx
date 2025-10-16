'use client';

import React from 'react';
import Link from 'next/link';
import { GoogleIcon } from '../../components/ui/icons';

export default function AccountPage() {
  const handleGoogleSignUp = () => {
    console.log('Redirecting to Google Sign-up...');
    // TODO: Implement Google OAuth
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center w-full max-w-sm">
          <div className="mb-16">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">New here?</h2>
            <div className="space-y-4">
              <Link
                href="/auth/signup"
                className="w-full bg-[#38761d] text-white py-3 px-6 rounded-full text-lg font-semibold hover:bg-opacity-90 transition-colors shadow-sm block text-center"
              >
                Create account
              </Link>
              <button
                onClick={handleGoogleSignUp}
                className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-6 rounded-full text-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center shadow-sm"
              >
                <GoogleIcon />
                Sign up with Google
              </button>
              <Link
                href="/checkout"
                className="w-full bg-white text-[#38761d] border border-[#38761d] py-3 px-6 rounded-full text-lg font-semibold hover:bg-green-50/50 transition-colors block text-center"
              >
                Continue as guest
              </Link>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Returning customer?</h2>
            <Link
              href="/auth/signin"
              className="w-full bg-[#38761d] text-white py-3 px-6 rounded-full text-lg font-semibold hover:bg-opacity-90 transition-colors shadow-sm block text-center"
            >
              Sign in
            </Link>
          </div>
        </div>
    </div>
  );
}
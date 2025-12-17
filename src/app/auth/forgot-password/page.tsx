"use client";

import Image from "next/image";
import Link from "next/link";
import type React from "react";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { CheckCircleIcon, MailIcon } from "@/components/ui/icons";
import { trpc } from "@/utils/trpc";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isOAuthOnly, setIsOAuthOnly] = useState(false);
  const [oauthProvider, setOauthProvider] = useState("");

  const requestPasswordResetMutation = trpc.requestPasswordReset.useMutation({
    onSuccess: (data) => {
      if (data.isOAuthOnly) {
        // OAuth-only account - show special message
        setIsOAuthOnly(true);
        setOauthProvider(data.provider || "Google");
        toast.info(data.message);
      } else {
        // Normal flow - email sent or user not found (same message for security)
        setIsSuccess(true);
        toast.success(data.message);
      }
    },
    onError: (error) => {
      toast.error(
        error.message || "Unable to send reset email. Please try again.",
      );
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    requestPasswordResetMutation.mutate({ email: email.trim() });
  };

  const handleResendEmail = async () => {
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    requestPasswordResetMutation.mutate({ email: email.trim() });
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/" });
  };

  // OAuth-only account - show sign in with provider message
  if (isOAuthOnly) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Link href="/" className="flex items-center h-full">
                <Image
                  src="/T3.png"
                  alt="Trichomes Logo"
                  width={120}
                  height={100}
                  className="object-contain"
                />
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <title>Google Account</title>
                <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {oauthProvider} Account Detected
            </h1>
            <p className="text-gray-600 mb-6">
              The account <span className="font-medium text-gray-900">{email}</span> uses {oauthProvider} sign-in.
              You don't need to reset a password - just sign in with {oauthProvider}!
            </p>

            <div className="space-y-4">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <title>Google</title>
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign in with Google
              </button>

              <Link
                href="/auth/signin"
                className="w-full block text-center py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Back to Sign In
              </Link>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                💡 <strong>Tip:</strong> Accounts created with {oauthProvider} sign-in don't require a password.
                Just click the button above to sign in instantly!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Link href="/" className="flex items-center h-full">
                <Image
                  src="/T3.png"
                  alt="Trichomes Logo"
                  width={120}
                  height={100}
                  className="object-contain"
                />
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircleIcon />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Check your email
            </h1>
            <p className="text-gray-600 mb-6">
              We've sent a password reset link to{" "}
              <span className="font-medium text-gray-900">{email}</span>
            </p>

            <div className="space-y-4">
              <button
                type="button"
                onClick={handleResendEmail}
                disabled={requestPasswordResetMutation.isPending}
                className="w-full bg-[#38761d] text-white py-3 px-4 rounded-lg hover:bg-opacity-90 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {requestPasswordResetMutation.isPending
                  ? "Resending..."
                  : "Resend Email"}
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
                Didn't receive the email? Check your spam folder or{" "}
                <button
                  type="button"
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
              <Image
                src="/T3.png"
                alt="Trichomes Logo"
                width={120}
                height={100}
                className="object-contain"
              />
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Forgot password?
          </h1>
          <p className="text-gray-600">
            No worries, we'll send you reset instructions
          </p>
        </div>

        {/* Reset Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
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
                Enter the email address associated with your account and we'll
                send you a link to reset your password.
              </p>
            </div>

            <button
              type="submit"
              disabled={requestPasswordResetMutation.isPending || !email.trim()}
              className="w-full bg-[#38761d] text-white py-3 px-4 rounded-lg hover:bg-opacity-90 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {requestPasswordResetMutation.isPending
                ? "Sending..."
                : "Send Reset Instructions"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/auth/signin"
              className="text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center justify-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <title>Back</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to sign in
            </Link>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Still having trouble?{" "}
            <Link
              href="/contact"
              className="text-green-600 hover:text-green-700 underline"
            >
              Contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

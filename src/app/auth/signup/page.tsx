'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogoIcon, EyeIcon, GoogleIcon, CheckCircleIcon } from '../../components/ui/icons';
import { useAuth } from '../../contexts/auth-context';

interface SignUpForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  newsletterOptIn: boolean;
}

interface PasswordStrength {
  score: number;
  feedback: string[];
}

export default function SignUpPage() {
  const router = useRouter();
  const { signUpWithCredentials, signInWithGoogle, isLoading: authLoading } = useAuth();
  const [shouldRedirectToCheckout, setShouldRedirectToCheckout] = useState(false);

  useEffect(() => {
    // Check if user came from cart and should redirect to checkout after registration
    const checkoutRedirect = localStorage.getItem('trichomes_checkout_redirect');
    if (checkoutRedirect === 'true') {
      setShouldRedirectToCheckout(true);
    }
  }, []);

  const [form, setForm] = useState<SignUpForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    newsletterOptIn: true
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<SignUpForm>>({});

  const isLoading = authLoading;

  const getPasswordStrength = (password: string): PasswordStrength => {
    let score = 0;
    const feedback: string[] = [];

    if (password.length >= 8) score++;
    else feedback.push('At least 8 characters');

    if (/[A-Z]/.test(password)) score++;
    else feedback.push('One uppercase letter');

    if (/[a-z]/.test(password)) score++;
    else feedback.push('One lowercase letter');

    if (/[0-9]/.test(password)) score++;
    else feedback.push('One number');

    if (/[^A-Za-z0-9]/.test(password)) score++;
    else feedback.push('One special character');

    return { score, feedback };
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<SignUpForm> = {};

    if (!form.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!form.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Invalid email address';
    if (!form.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!form.password) newErrors.password = 'Password is required';
    if (form.password && form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!form.acceptTerms) newErrors.acceptTerms = 'You must accept the terms and conditions';

    const passwordStrength = getPasswordStrength(form.password);
    if (form.password && passwordStrength.score < 3) {
      newErrors.password = 'Password is too weak';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear specific error when user starts typing
    if (errors[name as keyof SignUpForm]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      // Use NextAuth registration
      await signUpWithCredentials({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
      });

      // Clear checkout redirect flag
      localStorage.removeItem('trichomes_checkout_redirect');

      // Redirect based on context
      if (shouldRedirectToCheckout) {
        router.push('/checkout');
      } else {
        router.push('/');
      }
    } catch (err: unknown) {
      // Following CODING_RULES.md - proper error handling
      if (err instanceof Error && err.message.includes('already exists')) {
        setErrors({ email: 'An account with this email already exists' });
      } else if (err instanceof Error) {
        setErrors({ email: err.message });
      } else {
        setErrors({ email: 'Registration failed. Please try again.' });
      }
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      // Following CODING_RULES.md - proper error handling
      console.error('Google sign-up failed:', error);
      setErrors({ email: 'Google sign-up failed. Please try again.' });
    }
  };

  const passwordStrength = getPasswordStrength(form.password);
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <LogoIcon />
            <span className="ml-2 text-2xl font-bold text-[#4CAF50]">TRICHOMES</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Create your account</h1>
          <p className="text-gray-600">Join us for the best skincare experience</p>
        </div>

        {/* Sign Up Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors ${
                    errors.firstName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="First name"
                />
                {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors ${
                    errors.lastName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Last name"
                />
                {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
              </div>
            </div>

            {/* Email */}
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
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your email"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={form.phone}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="+234 801 234 5678"
              />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>

            {/* Password */}
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
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors pr-12 ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <EyeIcon className="w-5 h-5" />
                </button>
              </div>

              {form.password && (
                <div className="mt-2">
                  <div className="flex space-x-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full ${
                          i < passwordStrength.score ? strengthColors[passwordStrength.score - 1] : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-600">
                    Password strength: {strengthLabels[passwordStrength.score - 1] || 'Very Weak'}
                  </p>
                  {passwordStrength.feedback.length > 0 && (
                    <ul className="text-xs text-gray-500 mt-1 space-y-1">
                      {passwordStrength.feedback.map((item, i) => (
                        <li key={i}>• {item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors pr-12 ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <EyeIcon className="w-5 h-5" />
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>

            {/* Checkboxes */}
            <div className="space-y-3">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  name="acceptTerms"
                  checked={form.acceptTerms}
                  onChange={handleInputChange}
                  className={`mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded ${
                    errors.acceptTerms ? 'border-red-500' : ''
                  }`}
                />
                <label htmlFor="acceptTerms" className="ml-2 text-sm text-gray-700">
                  I agree to the{' '}
                  <Link href="/terms" className="text-green-600 hover:text-green-700 underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-green-600 hover:text-green-700 underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>
              {errors.acceptTerms && <p className="text-sm text-red-600">{errors.acceptTerms}</p>}

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="newsletterOptIn"
                  name="newsletterOptIn"
                  checked={form.newsletterOptIn}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="newsletterOptIn" className="ml-2 text-sm text-gray-700">
                  Send me skincare tips and special offers
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !form.acceptTerms}
              className="w-full bg-[#38761d] text-white py-3 px-4 rounded-lg hover:bg-opacity-90 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-sm text-gray-500">or</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Google Sign Up */}
          <button
            onClick={handleGoogleSignUp}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          {/* Sign In Link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/signin" className="text-green-600 hover:text-green-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
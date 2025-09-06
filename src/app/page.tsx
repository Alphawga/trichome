'use client';

import Image from "next/image";
import { useState, useEffect } from "react";

export default function Home() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubscribed(true);
        setEmail('');
        setTimeout(() => setIsSubscribed(false), 4000);
      } else {
        if (data.alreadyExists) {
          setError('This email is already subscribed!');
        } else {
          setError(data.error || 'Something went wrong. Please try again.');
        }
      }
    } catch (error) {
      console.error('Subscription error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="font-sans min-h-screen overflow-hidden relative">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMmM1NWUiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] animate-pulse"></div>
        
        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-green-200 rounded-full opacity-20 animate-float"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-emerald-200 rounded-full opacity-20 animate-float-delayed"></div>
        <div className="absolute bottom-40 left-20 w-12 h-12 bg-teal-200 rounded-full opacity-20 animate-float-slow"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-green-100 rounded-full opacity-20 animate-float"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8 text-center">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Logo with enhanced animation */}
          <div className="transform transition-all duration-1000 hover:scale-105">
            <Image
              src="/T2 (1).png"
              alt="Trichomes Cosmeceuticals & Skincare Logo"
              width={700}
              height={350}
              priority
              className="mx-auto filter drop-shadow-2xl animate-fade-in-up"
            />
          </div>

          {/* Coming Soon Text with gradient */}
          <div className="space-y-6 animate-fade-in-up-delay">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent animate-gradient-x">
              Coming Soon
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed font-light">
              Revolutionary cosmeceutical formulations inspired by nature's most powerful botanical ingredients. 
              <span className="block mt-2 text-green-600 font-medium">Prepare your skin for the future.</span>
            </p>
          </div>


          {/* Email Subscription */}
          <div className="animate-fade-in-up-delay-2">
            <div className="max-w-md mx-auto">
              <h3 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4">
                Be the first to know
              </h3>
              <p className="text-gray-600 mb-6">
                Get notified when we launch and receive exclusive early access offers.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    placeholder="Enter your email address"
                    className={`flex-1 px-6 py-4 rounded-full border-2 ${error ? 'border-red-300' : 'border-green-200'} focus:border-green-500 outline-none bg-white/80 backdrop-blur-sm text-gray-800 placeholder-gray-500 transition-colors duration-300`}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={isSubscribed || isLoading}
                    className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap min-w-[120px]"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Saving...
                      </div>
                    ) : isSubscribed ? '✓ Subscribed!' : 'Notify Me'}
                  </button>
                </div>
              </form>

              {error && (
                <div className="mt-4 p-4 bg-red-100 text-red-800 rounded-lg animate-fade-in">
                  {error}
                </div>
              )}

              {isSubscribed && (
                <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-lg animate-fade-in">
                  🎉 Thank you! We'll keep you updated on our launch.
                </div>
              )}
            </div>
          </div>

          {/* Social Proof */}
          <div className="animate-fade-in-up-delay-3">
            <div className="flex items-center justify-center space-x-8 text-gray-500">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm">Scientifically Formulated</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                <span className="text-sm">Clinically Tested</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                <span className="text-sm">Nature Inspired</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-3deg); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes gradient-x {
          0%, 100% {
            background-size: 200% 200%;
            background-position: left center;
          }
          50% {
            background-size: 200% 200%;
            background-position: right center;
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 10s ease-in-out infinite;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }
        .animate-fade-in-up-delay {
          animation: fade-in-up 0.8s ease-out 0.2s both;
        }
        .animate-fade-in-up-delay-2 {
          animation: fade-in-up 0.8s ease-out 0.4s both;
        }
        .animate-fade-in-up-delay-3 {
          animation: fade-in-up 0.8s ease-out 0.6s both;
        }
        .animate-fade-in-up-delay-4 {
          animation: fade-in-up 0.8s ease-out 0.8s both;
        }
        .animate-gradient-x {
          animation: gradient-x 3s ease infinite;
        }
        .animate-fade-in {
          animation: fade-in-up 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}

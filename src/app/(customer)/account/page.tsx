"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { toast } from "sonner";
import { GoogleIcon } from "@/components/ui/icons";

function AccountPageContent() {
  const searchParams = useSearchParams();

  const handleGoogleSignUp = async () => {
    try {
      // Get callback URL from query params or default to home
      const callbackUrl = searchParams.get("callbackUrl") || "/";

      // Use NextAuth signIn for Google OAuth
      const { signIn } = await import("next-auth/react");
      await signIn("google", {
        callbackUrl,
        redirect: true,
      });
    } catch (error) {
      console.error("Google sign in failed:", error);
      toast.error("Failed to sign in with Google. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-trichomes-soft flex flex-col items-center justify-center px-4 py-12 sm:py-16">
      <div className="w-full max-w-md">
        {/* New Customer Section */}
        <div className="mb-12 sm:mb-16">
          <h2 className="text-[24px] sm:text-[28px] font-heading font-semibold text-trichomes-forest mb-6 text-center">
            New here?
          </h2>
          <div className="space-y-4">
            <Link
              href="/auth/signup"
              className="w-full bg-trichomes-gold text-trichomes-forest py-3 sm:py-4 px-6 rounded-full text-[15px] sm:text-[16px] lg:text-[17px] font-semibold hover:bg-trichomes-gold-hover transition-all duration-150 ease-out hover:shadow-lg shadow-sm block text-center font-body"
            >
              Create account
            </Link>
            <button
              type="button"
              onClick={handleGoogleSignUp}
              className="w-full bg-white border-2 border-trichomes-forest/20 text-trichomes-forest py-3 sm:py-4 px-6 rounded-full text-[15px] sm:text-[16px] lg:text-[17px] font-semibold hover:bg-trichomes-soft transition-all duration-150 ease-out shadow-sm flex items-center justify-center font-body"
            >
              <GoogleIcon className="mr-2" />
              Sign up with Google
            </button>
            <Link
              href="/checkout?guest=true"
              className="w-full bg-white text-trichomes-primary border-2 border-trichomes-primary py-3 sm:py-4 px-6 rounded-full text-[15px] sm:text-[16px] lg:text-[17px] font-semibold hover:bg-trichomes-primary hover:text-white transition-all duration-150 ease-out block text-center font-body"
            >
              Continue as guest
            </Link>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center mb-12 sm:mb-16">
          <div className="flex-1 border-t border-trichomes-forest/20"></div>
          <span className="px-4 text-trichomes-forest/60 text-sm font-body">
            or
          </span>
          <div className="flex-1 border-t border-trichomes-forest/20"></div>
        </div>

        {/* Returning Customer Section */}
        <div>
          <h2 className="text-[24px] sm:text-[28px] font-heading font-semibold text-trichomes-forest mb-6 text-center">
            Returning customer?
          </h2>
          <Link
            href="/auth/signin"
            className="w-full bg-trichomes-primary text-white py-3 sm:py-4 px-6 rounded-full text-[15px] sm:text-[16px] lg:text-[17px] font-semibold hover:bg-trichomes-primary/90 transition-all duration-150 ease-out hover:shadow-lg shadow-sm block text-center font-body"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-trichomes-soft flex items-center justify-center">
      <div className="text-center">
        <p className="text-trichomes-forest font-body">Loading...</p>
      </div>
    </div>}>
      <AccountPageContent />
    </Suspense>
  );
}

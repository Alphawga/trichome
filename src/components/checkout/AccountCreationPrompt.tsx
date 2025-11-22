"use client";
import { useRouter } from "next/navigation";

interface AccountCreationPromptProps {
  /** Order email for account creation */
  email: string;
  /** Order number */
  orderNumber: string;
  /** Callback when user chooses to create account */
  onCreateAccount?: () => void;
  /** Callback when user chooses to skip */
  onSkip?: () => void;
}

/**
 * Reusable AccountCreationPrompt component
 *
 * Shown after guest checkout to encourage account creation
 * Allows users to create an account using their order email
 */
export function AccountCreationPrompt({
  email,
  orderNumber,
  onCreateAccount,
  onSkip,
}: AccountCreationPromptProps) {
  const router = useRouter();

  const handleCreateAccount = () => {
    if (onCreateAccount) {
      onCreateAccount();
    } else {
      // Redirect to signup with email pre-filled
      router.push(
        `/auth/signup?email=${encodeURIComponent(email)}&order=${orderNumber}`,
      );
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl border border-trichomes-forest/10 shadow-sm">
      <div className="text-center">
        <div className="w-16 h-16 bg-trichomes-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-trichomes-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <title>Account</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>

        <h3 className="text-[20px] sm:text-[24px] font-heading font-semibold text-trichomes-forest mb-2">
          Create an Account?
        </h3>

        <p className="text-[14px] sm:text-[15px] text-trichomes-forest/70 font-body mb-6 max-w-md mx-auto">
          Create an account with <strong>{email}</strong> to track your order,
          save addresses, and enjoy faster checkout on future purchases.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <button
            type="button"
            onClick={handleCreateAccount}
            className="bg-trichomes-primary text-white py-3 px-6 sm:px-8 rounded-full hover:bg-trichomes-primary/90 font-semibold transition-all duration-150 ease-out hover:shadow-lg text-[14px] sm:text-[15px] font-body"
          >
            Create Account
          </button>

          <button
            type="button"
            onClick={handleSkip}
            className="bg-white border-2 border-trichomes-forest/20 text-trichomes-forest py-3 px-6 sm:px-8 rounded-full hover:bg-trichomes-soft font-semibold transition-all duration-150 ease-out text-[14px] sm:text-[15px] font-body"
          >
            Maybe Later
          </button>
        </div>

        <p className="text-[12px] sm:text-[13px] text-trichomes-forest/60 font-body mt-4">
          You can track your order using order number{" "}
          <strong>{orderNumber}</strong> and email <strong>{email}</strong>
        </p>
      </div>
    </div>
  );
}

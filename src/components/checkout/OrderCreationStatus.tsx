"use client";

interface OrderCreationStatusProps {
  status: "idle" | "processing" | "success" | "error";
  error?: string;
  onRetry?: () => void;
}

export function OrderCreationStatus({
  status,
  error,
  onRetry,
}: OrderCreationStatusProps) {
  if (status === "processing") {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trichomes-primary mx-auto mb-4"></div>
        </div>
        <p className="text-trichomes-forest/70 font-body text-[15px] sm:text-[16px]">
          Processing your order...
        </p>
        <p className="text-trichomes-forest/50 font-body text-[13px] sm:text-[14px] mt-2">
          Please wait while we confirm your payment and create your order.
        </p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <title>Success</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <p className="text-trichomes-forest font-body font-semibold text-[16px] sm:text-[18px]">
          Order created successfully!
        </p>
        <p className="text-trichomes-forest/60 font-body text-[14px] sm:text-[15px] mt-2">
          Redirecting to order confirmation...
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <title>Error</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <p className="text-trichomes-forest font-body font-semibold text-[16px] sm:text-[18px] mb-2">
          Order creation failed
        </p>
        <p className="text-red-600 font-body text-[14px] sm:text-[15px] mb-4 text-center max-w-md">
          {error ||
            "An error occurred while creating your order. Please try again."}
        </p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="bg-trichomes-primary text-white py-3 px-6 rounded-lg hover:bg-trichomes-primary/90 font-semibold transition-all duration-150 ease-out hover:shadow-lg text-[14px] sm:text-[15px] font-body"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  return null;
}

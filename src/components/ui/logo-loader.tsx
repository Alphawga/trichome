"use client";

import Image from "next/image";

interface LogoLoaderProps {
    size?: "sm" | "md" | "lg";
    text?: string;
    className?: string;
}

const sizeClasses = {
    sm: { className: "w-8 h-8", size: 32 },
    md: { className: "w-12 h-12", size: 48 },
    lg: { className: "w-16 h-16", size: 64 },
};

/**
 * Animated Logo Loader Component
 * Uses the Trichomes logo with a pulsing animation for loading states
 */
export function LogoLoader({ size = "md", text, className = "" }: LogoLoaderProps) {
    const sizeConfig = sizeClasses[size];

    return (
        <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
            <div className={`relative ${sizeConfig.className} animate-pulse-scale`}>
                <Image
                    src="/T3.png"
                    alt="Loading..."
                    width={sizeConfig.size}
                    height={sizeConfig.size}
                    className="object-contain w-full h-full"
                    priority
                />
                {/* Subtle rotating ring around the logo */}
                <div className="absolute inset-0 rounded-full border-2 border-trichomes-primary/30 animate-spin-slow" />
            </div>
            {text && (
                <p className="text-sm text-gray-600 font-medium animate-pulse">{text}</p>
            )}
        </div>
    );
}

/**
 * Simpler loading spinner using the brand color
 * For inline loading states
 */
export function LogoSpinner({ size = "md", className = "" }: Omit<LogoLoaderProps, "text">) {
    const spinnerSizes = {
        sm: "w-4 h-4 border-2",
        md: "w-6 h-6 border-2",
        lg: "w-8 h-8 border-[3px]",
    };

    return (
        <div
            className={`${spinnerSizes[size]} border-trichomes-primary border-t-transparent rounded-full animate-spin ${className}`}
        />
    );
}

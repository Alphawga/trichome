"use client";

import { useSession } from "next-auth/react";
import Script from "next/script";
import { useCallback, useEffect, useRef } from "react";

interface GoogleOneTapProps {
    /** Whether to show the One Tap prompt on page load */
    enabled?: boolean;
    /** Callback when sign-in is successful */
    onSuccess?: () => void;
    /** Callback when sign-in fails */
    onError?: (error: string) => void;
}

// Extend window type for Google Identity Services
declare global {
    interface Window {
        google?: {
            accounts: {
                id: {
                    initialize: (config: GoogleOneTapConfig) => void;
                    prompt: (callback?: (notification: PromptNotification) => void) => void;
                    cancel: () => void;
                    renderButton: (
                        element: HTMLElement,
                        options: GoogleButtonOptions
                    ) => void;
                };
            };
        };
    }
}

interface GoogleOneTapConfig {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
    context?: "signin" | "signup" | "use";
    itp_support?: boolean;
}

interface GoogleCredentialResponse {
    credential: string;
    select_by: string;
    clientId?: string;
}

interface PromptNotification {
    isNotDisplayed: () => boolean;
    isSkippedMoment: () => boolean;
    isDismissedMoment: () => boolean;
    getNotDisplayedReason: () => string;
    getSkippedReason: () => string;
    getDismissedReason: () => string;
}

interface GoogleButtonOptions {
    type?: "standard" | "icon";
    theme?: "outline" | "filled_blue" | "filled_black";
    size?: "large" | "medium" | "small";
    text?: "signin_with" | "signup_with" | "continue_with" | "signin";
    shape?: "rectangular" | "pill" | "circle" | "square";
    logo_alignment?: "left" | "center";
    width?: number;
}

export function GoogleOneTap({
    enabled = true,
    onSuccess,
    onError,
}: GoogleOneTapProps) {
    const { status } = useSession();
    const initialized = useRef(false);

    const handleCredentialResponse = useCallback(
        async (response: GoogleCredentialResponse) => {
            try {
                // Send the credential to our API to verify and create session
                const res = await fetch("/api/auth/google-one-tap", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        credential: response.credential,
                    }),
                });

                if (res.ok) {
                    // Reload the page to get the new session
                    onSuccess?.();
                    window.location.reload();
                } else {
                    const data = await res.json();
                    onError?.(data.error || "Authentication failed");
                }
            } catch (error) {
                console.error("Google One Tap error:", error);
                onError?.("An error occurred during authentication");
            }
        },
        [onSuccess, onError]
    );

    const initializeGoogleOneTap = useCallback(() => {
        if (
            !window.google?.accounts?.id ||
            initialized.current ||
            status === "authenticated"
        ) {
            return;
        }

        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        if (!clientId) {
            console.warn("Google Client ID not configured for One Tap");
            return;
        }

        try {
            window.google.accounts.id.initialize({
                client_id: clientId,
                callback: handleCredentialResponse,
                auto_select: false, // Don't auto-select, let user confirm
                cancel_on_tap_outside: true,
                context: "signin",
                itp_support: true, // Support Safari ITP
            });

            // Show the One Tap prompt
            window.google.accounts.id.prompt((notification: PromptNotification) => {
                if (notification.isNotDisplayed()) {
                    console.log(
                        "One Tap not displayed:",
                        notification.getNotDisplayedReason()
                    );
                } else if (notification.isSkippedMoment()) {
                    console.log("One Tap skipped:", notification.getSkippedReason());
                } else if (notification.isDismissedMoment()) {
                    console.log("One Tap dismissed:", notification.getDismissedReason());
                }
            });

            initialized.current = true;
        } catch (error) {
            console.error("Failed to initialize Google One Tap:", error);
        }
    }, [status, handleCredentialResponse]);

    useEffect(() => {
        // Only show One Tap for unauthenticated users
        if (!enabled || status === "authenticated" || status === "loading") {
            return;
        }

        // If Google script is already loaded, initialize
        if (window.google?.accounts?.id) {
            initializeGoogleOneTap();
        }

        // Cleanup on unmount
        return () => {
            if (window.google?.accounts?.id) {
                window.google.accounts.id.cancel();
            }
        };
    }, [enabled, status, initializeGoogleOneTap]);

    // Don't render anything if already authenticated
    if (status === "authenticated") {
        return null;
    }

    return (
        <Script
            src="https://accounts.google.com/gsi/client"
            strategy="afterInteractive"
            onLoad={initializeGoogleOneTap}
        />
    );
}

"use client";

import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";

interface EmailType {
    id: string;
    name: string;
    description: string;
    trigger: string;
    settingKey: string;
}

const emailTypes: EmailType[] = [
    {
        id: "welcome",
        name: "Welcome Email",
        description: "Sent when a new user registers an account",
        trigger: "User Registration",
        settingKey: "email_welcome_enabled",
    },
    {
        id: "order_confirmation",
        name: "Order Confirmation",
        description: "Sent after a successful purchase",
        trigger: "Order Placed",
        settingKey: "email_order_confirmation_enabled",
    },
    {
        id: "shipping",
        name: "Shipping Notification",
        description: "Sent when an order is shipped with tracking info",
        trigger: "Order Shipped",
        settingKey: "email_shipping_enabled",
    },
    {
        id: "password_reset",
        name: "Password Reset",
        description: "Sent when a user requests a password reset",
        trigger: "Password Reset Request",
        settingKey: "email_password_reset_enabled",
    },
    {
        id: "newsletter",
        name: "Newsletter Welcome",
        description: "Sent when a user subscribes to the newsletter",
        trigger: "Newsletter Subscription",
        settingKey: "email_newsletter_welcome_enabled",
    },
];

export default function AdminEmailSettingsPage() {
    const [testingEmail, setTestingEmail] = useState<string | null>(null);

    // Fetch current settings
    const settingsQuery = trpc.getSettings.useQuery(undefined, {
        staleTime: 60000,
    });

    // Mutation to update settings
    const upsertMutation = trpc.upsertSetting.useMutation({
        onSuccess: () => {
            settingsQuery.refetch();
            toast.success("Email setting updated");
        },
        onError: (error) => {
            toast.error(`Failed to update setting: ${error.message}`);
        },
    });

    // Mutation to send test email
    const sendTestEmailMutation = trpc.sendTestEmail.useMutation({
        onSuccess: () => {
            toast.success("Test email sent successfully!");
            setTestingEmail(null);
        },
        onError: (error) => {
            toast.error(`Failed to send test email: ${error.message}`);
            setTestingEmail(null);
        },
    });

    const settings = settingsQuery.data || [];

    const getSettingValue = (key: string): boolean => {
        const setting = settings.find((s) => s.key === key);
        return setting?.value === "true";
    };

    const handleToggle = (settingKey: string, currentValue: boolean) => {
        upsertMutation.mutate({
            key: settingKey,
            value: (!currentValue).toString(),
            type: "boolean",
        });
    };

    const handleSendTest = (emailType: string) => {
        setTestingEmail(emailType);
        sendTestEmailMutation.mutate({ emailType });
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Email Settings</h1>
                <p className="text-gray-600">
                    Manage automated email notifications and templates
                </p>
            </div>

            {/* SMTP Configuration Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                    <svg
                        className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                    <div>
                        <h3 className="font-semibold text-amber-800">SMTP Configuration Required</h3>
                        <p className="text-sm text-amber-700 mt-1">
                            Ensure your SMTP credentials are configured in your environment variables
                            (SMTP_HOST, SMTP_USER, SMTP_PASSWORD) for emails to be sent.
                        </p>
                    </div>
                </div>
            </div>

            {/* Email Types List */}
            {settingsQuery.isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-[#38761d] border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="space-y-4">
                    {emailTypes.map((email) => {
                        const isEnabled = getSettingValue(email.settingKey);
                        const isTesting = testingEmail === email.id;

                        return (
                            <div
                                key={email.id}
                                className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {email.name}
                                            </h3>
                                            <span
                                                className={`px-2 py-0.5 text-xs font-medium rounded-full ${isEnabled
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-gray-100 text-gray-600"
                                                    }`}
                                            >
                                                {isEnabled ? "Enabled" : "Disabled"}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 text-sm mb-2">
                                            {email.description}
                                        </p>
                                        <p className="text-gray-500 text-xs">
                                            <span className="font-medium">Trigger:</span> {email.trigger}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {/* Toggle Switch */}
                                        <button
                                            type="button"
                                            onClick={() => handleToggle(email.settingKey, isEnabled)}
                                            disabled={upsertMutation.isPending}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isEnabled ? "bg-[#38761d]" : "bg-gray-300"
                                                } disabled:opacity-50`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isEnabled ? "translate-x-6" : "translate-x-1"
                                                    }`}
                                            />
                                        </button>

                                        {/* Test Send Button */}
                                        <button
                                            type="button"
                                            onClick={() => handleSendTest(email.id)}
                                            disabled={isTesting || !isEnabled}
                                            className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {isTesting ? (
                                                <span className="flex items-center gap-2">
                                                    <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></span>
                                                    Sending...
                                                </span>
                                            ) : (
                                                "Send Test"
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Additional Info */}
            <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3">About Email Notifications</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-[#38761d] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Toggling an email type off will prevent that email from being sent to users.
                    </li>
                    <li className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-[#38761d] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Test emails are sent to the currently logged-in admin's email address.
                    </li>
                    <li className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-[#38761d] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Password Reset emails are critical for account security and should generally remain enabled.
                    </li>
                </ul>
            </div>
        </div>
    );
}

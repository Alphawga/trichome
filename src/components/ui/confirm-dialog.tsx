"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
import type * as React from "react";

import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void | Promise<void>;
    isLoading?: boolean;
    variant?: "danger" | "warning" | "default";
    icon?: React.ReactNode;
}

/**
 * ConfirmDialog Component
 *
 * A reusable confirmation dialog for destructive or important actions.
 * Uses Radix UI Dialog primitive for accessibility.
 *
 * @example
 * ```tsx
 * <ConfirmDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="Delete Product"
 *   description="Are you sure you want to delete this product? This action cannot be undone."
 *   onConfirm={handleDelete}
 *   variant="danger"
 *   isLoading={isDeleting}
 * />
 * ```
 */
export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    onConfirm,
    isLoading = false,
    variant = "default",
    icon,
}: ConfirmDialogProps) {
    const handleConfirm = async () => {
        await onConfirm();
    };

    const variantStyles = {
        danger: {
            icon: "bg-red-100 text-red-600",
            button: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
        },
        warning: {
            icon: "bg-yellow-100 text-yellow-600",
            button: "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500",
        },
        default: {
            icon: "bg-blue-100 text-blue-600",
            button: "bg-[#38761d] hover:bg-[#2d5f17] focus:ring-green-500",
        },
    };

    const styles = variantStyles[variant];

    const defaultIcon =
        variant === "danger" ? (
            <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <title>Warning</title>
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
            </svg>
        ) : variant === "warning" ? (
            <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <title>Alert</title>
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            </svg>
        ) : (
            <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <title>Info</title>
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            </svg>
        );

    return (
        <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay
                    className={cn(
                        "fixed inset-0 z-50 bg-black/50",
                        "data-[state=open]:animate-in data-[state=closed]:animate-out",
                        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
                    )}
                />
                <DialogPrimitive.Content
                    className={cn(
                        "fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2",
                        "bg-white rounded-lg shadow-xl p-6",
                        "data-[state=open]:animate-in data-[state=closed]:animate-out",
                        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
                        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
                        "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
                        "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
                        "duration-200"
                    )}
                >
                    {/* Close button */}
                    <DialogPrimitive.Close
                        className="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:pointer-events-none"
                        disabled={isLoading}
                    >
                        <XIcon className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </DialogPrimitive.Close>

                    {/* Content */}
                    <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div
                            className={cn(
                                "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                                styles.icon
                            )}
                        >
                            {icon || defaultIcon}
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                            <DialogPrimitive.Title className="text-lg font-semibold text-gray-900">
                                {title}
                            </DialogPrimitive.Title>
                            {description && (
                                <DialogPrimitive.Description className="mt-2 text-sm text-gray-600">
                                    {description}
                                </DialogPrimitive.Description>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {cancelLabel}
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirm}
                            disabled={isLoading}
                            className={cn(
                                "px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
                                styles.button,
                                "flex items-center gap-2"
                            )}
                        >
                            {isLoading && (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            )}
                            {isLoading ? "Processing..." : confirmLabel}
                        </button>
                    </div>
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
}

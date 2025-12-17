"use client";

import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const passwordSchema = z
    .object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string().min(1, "Please confirm your password"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

type PasswordFormData = z.infer<typeof passwordSchema>;

export function PasswordForm() {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<PasswordFormData>({
        resolver: zodResolver(passwordSchema),
    });

    const changePasswordMutation = trpc.changePassword.useMutation({
        onSuccess: () => {
            toast.success("Password changed successfully");
            reset();
        },
        onError: (error) => {
            toast.error(error.message || "Failed to change password");
        },
    });

    const onSubmit = (data: PasswordFormData) => {
        changePasswordMutation.mutate({
            currentPassword: data.currentPassword,
            newPassword: data.newPassword,
        });
    };

    return (
        <div className="bg-white p-6 sm:p-8 rounded-sm border border-gray-200 shadow-sm max-w-2xl mt-8">
            <h2 className="text-[20px] font-heading font-bold text-gray-900 mb-6">
                Change Password
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                    <label
                        htmlFor="currentPassword"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Current Password
                    </label>
                    <input
                        id="currentPassword"
                        type="password"
                        {...register("currentPassword")}
                        className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:ring-[#407029] focus:border-[#407029] outline-none transition-colors"
                    />
                    {errors.currentPassword && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.currentPassword.message}
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label
                            htmlFor="newPassword"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            New Password
                        </label>
                        <input
                            id="newPassword"
                            type="password"
                            {...register("newPassword")}
                            className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:ring-[#407029] focus:border-[#407029] outline-none transition-colors"
                        />
                        {errors.newPassword && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.newPassword.message}
                            </p>
                        )}
                    </div>
                    <div>
                        <label
                            htmlFor="confirmPassword"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Confirm New Password
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            {...register("confirmPassword")}
                            className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:ring-[#407029] focus:border-[#407029] outline-none transition-colors"
                        />
                        {errors.confirmPassword && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.confirmPassword.message}
                            </p>
                        )}
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={changePasswordMutation.isPending}
                        className="bg-white border border-[#1E3024] text-[#1E3024] px-8 py-3 rounded-full hover:bg-gray-50 transition-colors font-bold text-sm uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {changePasswordMutation.isPending ? "Updating..." : "Update Password"}
                    </button>
                </div>
            </form>
        </div>
    );
}

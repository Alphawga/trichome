"use client";

import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface ProfileFormData {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
}

export function ProfileForm() {
    const utils = trpc.useUtils();
    const { data: user, isLoading } = trpc.getProfile.useQuery();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ProfileFormData>();

    const updateProfileMutation = trpc.updateProfile.useMutation({
        onSuccess: () => {
            utils.getProfile.invalidate();
            toast.success("Profile updated successfully");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to update profile");
        },
    });

    useEffect(() => {
        if (user) {
            reset({
                first_name: user.first_name || "",
                last_name: user.last_name || "",
                email: user.email,
                phone: user.phone || "",
            });
        }
    }, [user, reset]);

    const onSubmit = (data: ProfileFormData) => {
        updateProfileMutation.mutate({
            first_name: data.first_name,
            last_name: data.last_name,
            phone: data.phone,
        });
    };

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="animate-spin h-6 w-6 text-gray-400" />
            </div>
        );
    }

    return (
        <div className="bg-white p-6 sm:p-8 rounded-sm border border-gray-200 shadow-sm max-w-2xl">
            <h2 className="text-[20px] font-heading font-bold text-gray-900 mb-6">
                Personal Information
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label
                            htmlFor="first_name"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            First Name
                        </label>
                        <input
                            id="first_name"
                            type="text"
                            {...register("first_name", { required: "First name is required" })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:ring-[#407029] focus:border-[#407029] outline-none transition-colors"
                        />
                        {errors.first_name && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.first_name.message}
                            </p>
                        )}
                    </div>
                    <div>
                        <label
                            htmlFor="last_name"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Last Name
                        </label>
                        <input
                            id="last_name"
                            type="text"
                            {...register("last_name", { required: "Last name is required" })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:ring-[#407029] focus:border-[#407029] outline-none transition-colors"
                        />
                        {errors.last_name && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.last_name.message}
                            </p>
                        )}
                    </div>
                </div>

                <div>
                    <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Email Address
                    </label>
                    <input
                        id="email"
                        type="email"
                        {...register("email")}
                        disabled
                        className="w-full px-4 py-2 border border-gray-200 bg-gray-50 text-gray-500 rounded-sm cursor-not-allowed outline-none"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        Email cannot be changed directly. Contact support for assistance.
                    </p>
                </div>

                <div>
                    <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Phone Number
                    </label>
                    <input
                        id="phone"
                        type="tel"
                        {...register("phone")}
                        className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:ring-[#407029] focus:border-[#407029] outline-none transition-colors"
                        placeholder="+234..."
                    />
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={updateProfileMutation.isPending}
                        className="bg-[#1E3024] text-white px-8 py-3 rounded-full hover:bg-[#2A4030] transition-colors font-bold text-sm uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
}

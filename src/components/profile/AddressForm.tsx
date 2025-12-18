"use client";

import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Address } from "@prisma/client";
import { createAddressSchema, updateAddressSchema } from "@/lib/dto";

interface AddressFormProps {
    address?: Address;
    onSuccess: () => void;
    onCancel: () => void;
}

// Extend schemas to match form data structure if needed, or use directly
// Assuming dto schemas are compatible with frontend form
const formSchema = z.object({
    address_line1: z.string().min(1, "Street address is required"),
    address_line2: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().optional(),
    postal_code: z.string().optional(),
    country: z.string().min(1, "Country is required"),
    is_default: z.boolean().default(false),
});

type AddressFormData = z.infer<typeof formSchema>;

export function AddressForm({ address, onSuccess, onCancel }: AddressFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<AddressFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: address ? {
            address_line1: address.address_line1,
            address_line2: address.address_line2 || "",
            city: address.city,
            state: address.state || "",
            postal_code: address.postal_code || "",
            country: address.country,
            is_default: address.is_default
        } : {
            country: "Nigeria", // Default country
            is_default: false
        },
    });

    const utils = trpc.useUtils();

    const createAddressMutation = trpc.createAddress.useMutation({
        onSuccess: () => {
            utils.getAddresses.invalidate();
            toast.success("Address added successfully");
            onSuccess();
        },
        onError: (error) => {
            toast.error(error.message || "Failed to add address");
        },
    });

    const updateAddressMutation = trpc.updateAddress.useMutation({
        onSuccess: () => {
            utils.getAddresses.invalidate();
            toast.success("Address updated successfully");
            onSuccess();
        },
        onError: (error) => {
            toast.error(error.message || "Failed to update address");
        },
    });

    const onSubmit = (data: AddressFormData) => {
        if (address) {
            updateAddressMutation.mutate({
                id: address.id,
                ...data,
            });
        } else {
            createAddressMutation.mutate(data);
        }
    };

    const isPending = createAddressMutation.isPending || updateAddressMutation.isPending;

    return (
        <div className="bg-gray-50 p-6 rounded-sm border border-gray-200">
            <h3 className="font-heading font-bold text-lg mb-4">
                {address ? "Edit Address" : "Add New Address"}
            </h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Street Address
                    </label>
                    <input
                        {...register("address_line1")}
                        className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:ring-[#407029] focus:border-[#407029] outline-none"
                        placeholder="123 Main St"
                    />
                    {errors.address_line1 && (
                        <p className="mt-1 text-sm text-red-600">{errors.address_line1.message}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Apartment, suite, etc. (optional)
                    </label>
                    <input
                        {...register("address_line2")}
                        className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:ring-[#407029] focus:border-[#407029] outline-none"
                        placeholder="Apt 4B"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            City
                        </label>
                        <input
                            {...register("city")}
                            className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:ring-[#407029] focus:border-[#407029] outline-none"
                        />
                        {errors.city && (
                            <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            State / Province
                        </label>
                        <input
                            {...register("state")}
                            className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:ring-[#407029] focus:border-[#407029] outline-none"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Postal Code
                        </label>
                        <input
                            {...register("postal_code")}
                            className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:ring-[#407029] focus:border-[#407029] outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Country
                        </label>
                        <input
                            {...register("country")}
                            className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:ring-[#407029] focus:border-[#407029] outline-none"
                            defaultValue="Nigeria"
                        />
                        {errors.country && (
                            <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id="is_default"
                        {...register("is_default")}
                        className="h-4 w-4 text-[#407029] focus:ring-[#407029] border-gray-300 rounded"
                    />
                    <label htmlFor="is_default" className="text-sm text-gray-700 font-medium">
                        Set as default shipping address
                    </label>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-sm transition-colors text-sm font-medium"
                        disabled={isPending}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isPending}
                        className="bg-[#1E3024] text-white px-6 py-2 rounded-sm hover:bg-[#2A4030] transition-colors font-medium text-sm disabled:opacity-50"
                    >
                        {isPending ? "Saving..." : "Save Address"}
                    </button>
                </div>
            </form>
        </div>
    );
}

"use client";

import { useState } from "react";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";
import { EditIcon, PlusIcon, TrashIcon } from "@/components/ui/icons";
import { AddressForm } from "./AddressForm";
import type { Address } from "@prisma/client";
import { Loader2 } from "lucide-react";

export function AddressList() {
    const [isCreating, setIsCreating] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);

    const utils = trpc.useUtils();
    const { data: addresses, isLoading } = trpc.getAddresses.useQuery();

    const deleteAddressMutation = trpc.deleteAddress.useMutation({
        onSuccess: () => {
            utils.getAddresses.invalidate();
            toast.success("Address deleted successfully");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to delete address");
        },
    });

    const setDefaultAddressMutation = trpc.setDefaultAddress.useMutation({
        onSuccess: () => {
            utils.getAddresses.invalidate();
            toast.success("Default address updated");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to set default address");
        },
    });

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this address?")) {
            deleteAddressMutation.mutate({ id });
        }
    };

    const handleSetDefault = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setDefaultAddressMutation.mutate({ id });
    }

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="animate-spin h-6 w-6 text-gray-400" />
            </div>
        );
    }

    return (
        <div className="mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-[20px] sm:text-[24px] font-heading font-bold text-gray-900">
                    Saved Shipping Addresses
                </h2>
                {!isCreating && !editingAddress && (
                    <button
                        type="button"
                        onClick={() => setIsCreating(true)}
                        className="flex items-center gap-2 text-sm text-white bg-[#1E3024] rounded-full px-4 py-2 hover:bg-[#1E3024]/90 transition-all duration-150 ease-out font-body shadow-sm"
                    >
                        <PlusIcon /> Add New
                    </button>
                )}
            </div>

            {isCreating && (
                <div className="mb-6">
                    <AddressForm
                        onSuccess={() => setIsCreating(false)}
                        onCancel={() => setIsCreating(false)}
                    />
                </div>
            )}

            {editingAddress && (
                <div className="mb-6">
                    <AddressForm
                        address={editingAddress}
                        onSuccess={() => setEditingAddress(null)}
                        onCancel={() => setEditingAddress(null)}
                    />
                </div>
            )}

            <div className="space-y-4">
                {addresses?.length === 0 && !isCreating && (
                    <p className="text-gray-500 italic">No addresses saved yet.</p>
                )}

                {addresses?.map((address) => (
                    <div
                        key={address.id}
                        className={`bg-white p-4 sm:p-6 border rounded-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm hover:shadow-md transition-all duration-200 ease-out ${address.is_default ? "border-[#407029] ring-1 ring-[#407029]/20" : "border-gray-200"
                            }`}
                    >
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <p className="text-[15px] text-gray-900 font-body font-medium">
                                    {address.first_name} {address.last_name}
                                </p>
                                {address.is_default && (
                                    <span className="bg-[#407029]/10 text-[#407029] text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                                        Default
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-600 font-body">
                                {address.address_1} {address.address_2 && `, ${address.address_2}`}
                            </p>
                            <p className="text-sm text-gray-600 font-body">
                                {address.city}, {address.state} {address.postal_code}
                            </p>
                            <p className="text-sm text-gray-600 font-body">{address.country}</p>
                            {address.phone && <p className="text-sm text-gray-600 font-body">{address.phone}</p>}
                        </div>

                        <div className="flex items-center gap-3">
                            {!address.is_default && (
                                <button
                                    onClick={(e) => handleSetDefault(address.id, e)}
                                    className="text-xs text-[#407029] hover:underline font-medium mr-2"
                                >
                                    Set as Default
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => setEditingAddress(address)}
                                className="flex items-center gap-2 text-sm font-medium bg-gray-100 text-gray-900 rounded-sm px-3 py-2 hover:bg-gray-200 transition-all"
                                disabled={isCreating || !!editingAddress}
                            >
                                <EditIcon /> Edit
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDelete(address.id)}
                                className="flex items-center gap-2 text-sm font-medium bg-red-50 text-red-700 rounded-sm px-3 py-2 hover:bg-red-100 transition-all"
                                disabled={isCreating || !!editingAddress || deleteAddressMutation.isPending}
                            >
                                <TrashIcon /> Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

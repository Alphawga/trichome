"use client";

import { useRef, useState } from "react";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";
import { EditIcon, PlusIcon, TrashIcon } from "@/components/ui/icons";
import { AddressForm, type AddressFormRef } from "@/components/forms/AddressForm";
import { useAuth } from "@/app/contexts/auth-context";
import type { Address } from "@prisma/client";
import { Loader2 } from "lucide-react";

export function AddressList() {
    const { user } = useAuth();
    const [isCreating, setIsCreating] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const addressFormRef = useRef<AddressFormRef>(null);

    const utils = trpc.useUtils();
    const { data: addresses, isLoading } = trpc.getAddresses.useQuery();

    const createAddressMutation = trpc.createAddress.useMutation({
        onSuccess: () => {
            utils.getAddresses.invalidate();
            toast.success("Address added successfully");
            setIsCreating(false);
        },
        onError: (error) => {
            toast.error(error.message || "Failed to add address");
        },
    });

    const updateAddressMutation = trpc.updateAddress.useMutation({
        onSuccess: () => {
            utils.getAddresses.invalidate();
            toast.success("Address updated successfully");
            setEditingAddress(null);
        },
        onError: (error) => {
            toast.error(error.message || "Failed to update address");
        },
    });

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

    const handleSaveNew = () => {
        if (!addressFormRef.current?.isValid()) {
            addressFormRef.current?.validate();
            toast.error("Please fill in all required fields correctly");
            return;
        }

        const formData = addressFormRef.current.getData();
        createAddressMutation.mutate({
            first_name: formData.first_name,
            last_name: formData.last_name,
            phone: formData.phone || undefined,
            address_1: formData.address_1,
            address_2: formData.address_2 || undefined,
            city: formData.city,
            state: formData.state || undefined,
            postal_code: formData.postal_code || undefined,
            country: formData.country,
        });
    };

    const handleSaveEdit = () => {
        if (!editingAddress) return;

        if (!addressFormRef.current?.isValid()) {
            addressFormRef.current?.validate();
            toast.error("Please fill in all required fields correctly");
            return;
        }

        const formData = addressFormRef.current.getData();
        updateAddressMutation.mutate({
            id: editingAddress.id,
            first_name: formData.first_name,
            last_name: formData.last_name,
            phone: formData.phone || undefined,
            address_1: formData.address_1,
            address_2: formData.address_2 || undefined,
            city: formData.city,
            state: formData.state || undefined,
            postal_code: formData.postal_code || undefined,
            country: formData.country,
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
                <div className="mb-6 bg-gray-50 p-4 sm:p-6 border border-gray-200 rounded-sm">
                    <h3 className="font-heading font-bold text-lg mb-4">Add New Address</h3>
                    <AddressForm
                        ref={addressFormRef}
                        initialValues={{ email: user?.email }}
                        showEmail={false}
                        asDiv
                    />
                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={handleSaveNew}
                            disabled={createAddressMutation.isPending}
                            className="px-4 py-2 bg-[#1E3024] text-white rounded-sm font-medium text-sm hover:bg-[#1E3024]/90 transition-all disabled:opacity-50"
                        >
                            {createAddressMutation.isPending ? "Saving..." : "Save Address"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsCreating(false)}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-sm font-medium text-sm hover:bg-gray-100 transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {editingAddress && (
                <div className="mb-6 bg-gray-50 p-4 sm:p-6 border border-gray-200 rounded-sm">
                    <h3 className="font-heading font-bold text-lg mb-4">Edit Address</h3>
                    <AddressForm
                        ref={addressFormRef}
                        initialValues={{
                            first_name: editingAddress.first_name,
                            last_name: editingAddress.last_name,
                            email: user?.email,
                            phone: editingAddress.phone || "",
                            address_1: editingAddress.address_1,
                            address_2: editingAddress.address_2 || "",
                            city: editingAddress.city,
                            state: editingAddress.state || "",
                            postal_code: editingAddress.postal_code || "",
                            country: editingAddress.country || "Nigeria",
                        }}
                        showEmail={false}
                        asDiv
                    />
                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={handleSaveEdit}
                            disabled={updateAddressMutation.isPending}
                            className="px-4 py-2 bg-[#1E3024] text-white rounded-sm font-medium text-sm hover:bg-[#1E3024]/90 transition-all disabled:opacity-50"
                        >
                            {updateAddressMutation.isPending ? "Saving..." : "Save Changes"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setEditingAddress(null)}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-sm font-medium text-sm hover:bg-gray-100 transition-all"
                        >
                            Cancel
                        </button>
                    </div>
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

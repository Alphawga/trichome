"use client";

import type { Address } from "@prisma/client";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  AddressForm,
  type AddressFormRef,
} from "@/components/forms/AddressForm";
import { trpc } from "@/utils/trpc";

interface SavedAddressesProps {
  /** Show add new address button */
  showAddButton?: boolean;
  /** Show edit/delete actions */
  showActions?: boolean;
  /** Callback when address is selected */
  onSelectAddress?: (address: Address) => void;
  /** Callback when address is updated */
  onAddressUpdated?: () => void;
  /** Additional className */
  className?: string;
}

/**
 * SavedAddresses Component
 *
 * Reusable component for displaying and managing saved addresses.
 * Used in profile page and checkout flow.
 *
 * Follows Trichomes Design Guide principles:
 * - Reusable across different contexts
 * - Type-safe
 * - Proper error handling
 * - Loading states
 */
export function SavedAddresses({
  showAddButton = true,
  showActions = true,
  onSelectAddress,
  onAddressUpdated,
  className = "",
}: SavedAddressesProps) {
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const addressFormRef = useRef<AddressFormRef>(null);

  const {
    data: addresses,
    isLoading,
    refetch,
  } = trpc.getAddresses.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const deleteAddressMutation = trpc.deleteAddress.useMutation({
    onSuccess: () => {
      toast.success("Address deleted successfully");
      refetch();
      onAddressUpdated?.();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete address");
    },
  });

  const updateAddressMutation = trpc.updateAddress.useMutation({
    onSuccess: () => {
      toast.success("Address updated successfully");
      setEditingAddressId(null);
      refetch();
      onAddressUpdated?.();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update address");
    },
  });

  const createAddressMutation = trpc.createAddress.useMutation({
    onSuccess: () => {
      toast.success("Address added successfully");
      setShowAddForm(false);
      refetch();
      onAddressUpdated?.();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add address");
    },
  });

  const setDefaultAddressMutation = trpc.setDefaultAddress.useMutation({
    onSuccess: () => {
      toast.success("Default address updated");
      refetch();
      onAddressUpdated?.();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to set default address");
    },
  });

  const handleEdit = (address: Address) => {
    setEditingAddressId(address.id);
    setShowAddForm(false);
  };

  const handleCancelEdit = () => {
    setEditingAddressId(null);
    setShowAddForm(false);
  };

  const handleSaveEdit = async () => {
    if (!addressFormRef.current || !editingAddressId) return;

    if (!addressFormRef.current.isValid()) {
      addressFormRef.current.validate();
      toast.error("Please fill in all required fields correctly");
      return;
    }

    const formData = addressFormRef.current.getData();
    const address = addresses?.find((addr) => addr.id === editingAddressId);

    if (!address) return;

    updateAddressMutation.mutate({
      id: editingAddressId,
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

  const handleDelete = async (addressId: string) => {
    if (!confirm("Are you sure you want to delete this address?")) {
      return;
    }

    deleteAddressMutation.mutate({ id: addressId });
  };

  const handleSetDefault = (addressId: string) => {
    setDefaultAddressMutation.mutate({ id: addressId });
  };

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse space-y-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-24 bg-trichomes-soft rounded border border-trichomes-forest/15"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (!addresses || addresses.length === 0) {
    return (
      <div className={`${className}`}>
        <div className="bg-white p-6 rounded-xl border border-trichomes-forest/10 shadow-sm text-center">
          <p className="text-trichomes-forest/60 font-body mb-4">
            No saved addresses yet.
          </p>
          {showAddButton && (
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="text-trichomes-primary hover:text-trichomes-forest font-medium text-sm font-body transition-colors duration-150"
            >
              Add your first address
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-heading font-semibold text-trichomes-forest">
          Saved Addresses
        </h3>
        {showAddButton && (
          <button
            type="button"
            onClick={() => {
              setShowAddForm(!showAddForm);
              setEditingAddressId(null);
            }}
            className="text-sm text-trichomes-primary hover:text-trichomes-forest font-medium font-body transition-colors duration-150"
          >
            {showAddForm ? "Cancel" : "+ Add New Address"}
          </button>
        )}
      </div>

      {/* Add New Address Form */}
      {showAddForm && !editingAddressId && (
        <div className="bg-white p-6 rounded-xl border border-trichomes-forest/10 shadow-sm">
          <h4 className="text-base font-heading font-semibold text-trichomes-forest mb-4">
            Add New Address
          </h4>
          <AddressForm
            ref={addressFormRef}
            showEmail={false}
            showAddress2={true}
            showErrors={true}
            asDiv={true}
          />
          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={async () => {
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
                  is_default: addresses.length === 0, // Set as default if first address
                });
              }}
              className="px-4 py-2 bg-trichomes-primary text-white hover:bg-trichomes-primary/90 rounded font-medium text-sm font-body transition-colors duration-150"
            >
              Save Address
            </button>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-4 py-2 border border-trichomes-forest/20 text-trichomes-forest hover:bg-trichomes-soft rounded font-medium text-sm font-body transition-colors duration-150"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Address List */}
      <div className="space-y-3">
        {addresses.map((address) => (
          <div
            key={address.id}
            className={`bg-white p-4 sm:p-6 rounded-xl border-2 transition-all duration-150 ${
              address.is_default
                ? "border-trichomes-primary bg-trichomes-primary/5"
                : "border-trichomes-forest/10 hover:border-trichomes-forest/20"
            }`}
          >
            {editingAddressId === address.id ? (
              <div>
                <h4 className="text-base font-heading font-semibold text-trichomes-forest mb-4">
                  Edit Address
                </h4>
                <AddressForm
                  ref={addressFormRef}
                  initialValues={{
                    first_name: address.first_name,
                    last_name: address.last_name,
                    phone: address.phone || "",
                    address_1: address.address_1,
                    address_2: address.address_2 || "",
                    city: address.city,
                    state: address.state || "",
                    postal_code: address.postal_code || "",
                    country: address.country || "Nigeria",
                  }}
                  showEmail={false}
                  showAddress2={true}
                  showErrors={true}
                  asDiv={true}
                />
                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    disabled={updateAddressMutation.isPending}
                    className="px-4 py-2 bg-trichomes-primary text-white hover:bg-trichomes-primary/90 rounded font-medium text-sm font-body transition-colors duration-150 disabled:opacity-50"
                  >
                    {updateAddressMutation.isPending
                      ? "Saving..."
                      : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-4 py-2 border border-trichomes-forest/20 text-trichomes-forest hover:bg-trichomes-soft rounded font-medium text-sm font-body transition-colors duration-150"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-heading font-semibold text-trichomes-forest">
                        {address.first_name} {address.last_name}
                      </h4>
                      {address.is_default && (
                        <span className="px-2 py-0.5 bg-trichomes-primary/10 text-trichomes-primary text-xs font-medium rounded font-body">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-trichomes-forest/70 space-y-1 font-body">
                      <p>{address.address_1}</p>
                      {address.address_2 && <p>{address.address_2}</p>}
                      <p>
                        {address.city}, {address.state} {address.postal_code}
                      </p>
                      <p>{address.country}</p>
                      {address.phone && (
                        <p className="mt-2">Phone: {address.phone}</p>
                      )}
                    </div>
                  </div>
                </div>

                {showActions && (
                  <div className="flex items-center gap-3 pt-3 border-t border-trichomes-forest/10">
                    {!address.is_default && (
                      <button
                        type="button"
                        onClick={() => handleSetDefault(address.id)}
                        disabled={setDefaultAddressMutation.isPending}
                        className="text-xs text-trichomes-primary hover:text-trichomes-forest font-body transition-colors duration-150 disabled:opacity-50"
                      >
                        Set as Default
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleEdit(address)}
                      className="text-xs text-trichomes-primary hover:text-trichomes-forest font-body transition-colors duration-150"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(address.id)}
                      disabled={deleteAddressMutation.isPending}
                      className="text-xs text-red-600 hover:text-red-700 font-body transition-colors duration-150 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                )}

                {onSelectAddress && (
                  <button
                    type="button"
                    onClick={() => onSelectAddress(address)}
                    className="mt-3 w-full px-4 py-2 bg-trichomes-primary text-white hover:bg-trichomes-primary/90 rounded font-medium text-sm font-body transition-colors duration-150"
                  >
                    Select This Address
                  </button>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

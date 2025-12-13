"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { AddressFormData } from "@/components/forms/AddressForm";
import { trpc } from "@/utils/trpc";

interface SavedAddressesSelectorProps {
  onSelectAddress: (address: AddressFormData) => void;
  selectedAddressId?: string;
}


export function SavedAddressesSelector({
  onSelectAddress,
  selectedAddressId,
}: SavedAddressesSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { data: addresses, isLoading } = trpc.getAddresses.useQuery(undefined, {
    enabled: true,
  });

  const handleSelectAddress = (address: {
    first_name: string;
    last_name: string;
    phone?: string | null;
    address_1: string;
    address_2?: string | null;
    city: string;
    state?: string | null;
    postal_code?: string | null;
    country?: string | null;
  }) => {
    const addressData: AddressFormData = {
      first_name: address.first_name,
      last_name: address.last_name,
      email: "", // Email not stored in address
      phone: address.phone || "",
      address_1: address.address_1,
      address_2: address.address_2 || "",
      city: address.city,
      state: address.state || "",
      postal_code: address.postal_code || "",
      country: address.country || "Nigeria",
    };

    onSelectAddress(addressData);
    setIsOpen(false);
    toast.success("Address selected");
  };

  if (isLoading) {
    return (
      <div className="mb-6">
        <div className="animate-pulse">
          <div className="h-10 bg-trichomes-soft rounded border border-trichomes-forest/15"></div>
        </div>
      </div>
    );
  }

  if (!addresses || addresses.length === 0) {
    return null;
  }

  const selectedAddress = addresses.find(
    (addr) => addr.id === selectedAddressId,
  );
  const defaultAddress = addresses.find((addr) => addr.is_default);

  return (
    <div className="mb-6">
      <p className="block text-sm font-medium text-trichomes-forest mb-2">
        Saved Addresses
      </p>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 bg-trichomes-soft border border-trichomes-forest/15 text-left text-trichomes-forest focus:ring-1 focus:ring-trichomes-primary focus:border-trichomes-primary outline-none transition-colors duration-400 ease-out flex items-center justify-between"
        >
          <span className="text-sm">
            {selectedAddress
              ? `${selectedAddress.first_name} ${selectedAddress.last_name} - ${selectedAddress.city}`
              : defaultAddress
                ? `${defaultAddress.first_name} ${defaultAddress.last_name} - ${defaultAddress.city} (Default)`
                : "Select a saved address"}
          </span>
          <svg
            className={`w-5 h-5 text-trichomes-forest/60 transition-transform duration-300 ease-out ${
              isOpen ? "transform rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <title>Toggle</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {isOpen && (
          <>
            <button
              type="button"
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
              aria-label="Close address list"
            />
            <div className="absolute z-20 w-full mt-1 bg-white border border-trichomes-forest/15 shadow-lg max-h-60 overflow-auto">
              {addresses.map((address) => (
                <button
                  key={address.id}
                  type="button"
                  onClick={() => handleSelectAddress(address)}
                  className={`w-full px-4 py-3 text-left hover:bg-trichomes-soft transition-colors duration-150 ease-out ${
                    selectedAddressId === address.id
                      ? "bg-trichomes-soft border-l-4 border-trichomes-primary"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-trichomes-forest text-sm">
                          {address.first_name} {address.last_name}
                        </span>
                        {address.is_default && (
                          <span className="text-xs bg-trichomes-primary/10 text-trichomes-primary px-2 py-0.5">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-trichomes-forest/60 mt-1">
                        {address.address_1}
                        {address.address_2 && `, ${address.address_2}`}
                      </p>
                      <p className="text-sm text-trichomes-forest/60">
                        {address.city}, {address.state} {address.postal_code}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

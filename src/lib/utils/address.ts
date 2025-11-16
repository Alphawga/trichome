import type { AddressFormData } from "@/components/forms/AddressForm";
import type { CreateAddressInput } from "@/lib/dto";

/**
 * Address Utility Functions
 *
 * Provides utilities for converting between different address formats
 * and working with address data
 */

/**
 * Convert AddressFormData to CreateAddressInput
 * Removes email field (not stored in Address model) and maps fields
 */
export function addressFormToCreateInput(
  formData: AddressFormData,
  options?: {
    isDefault?: boolean;
    company?: string;
  },
): CreateAddressInput {
  return {
    first_name: formData.first_name,
    last_name: formData.last_name,
    address_1: formData.address_1,
    address_2: formData.address_2,
    city: formData.city,
    state: formData.state,
    postal_code: formData.postal_code,
    country: formData.country,
    phone: formData.phone,
    is_default: options?.isDefault ?? false,
    company: options?.company,
  };
}

/**
 * Format address for display
 */
export function formatAddress(address: {
  address_1: string;
  address_2?: string | null;
  city: string;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
}): string {
  const parts = [
    address.address_1,
    address.address_2,
    address.city,
    address.state,
    address.postal_code,
    address.country,
  ].filter(Boolean);

  return parts.join(", ");
}

/**
 * Format full address with name
 */
export function formatFullAddress(address: {
  first_name: string;
  last_name: string;
  address_1: string;
  address_2?: string | null;
  city: string;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
  phone?: string | null;
}): string {
  const name = `${address.first_name} ${address.last_name}`;
  const addressLine = formatAddress(address);
  const phone = address.phone ? `\nPhone: ${address.phone}` : "";

  return `${name}\n${addressLine}${phone}`;
}

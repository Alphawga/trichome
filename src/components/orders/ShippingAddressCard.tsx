"use client";

interface Address {
  first_name: string;
  last_name: string;
  address_1: string;
  address_2?: string | null;
  city: string;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
  phone?: string | null;
}

interface ShippingAddressCardProps {
  /** Shipping address data */
  address: Address;
  /** Show edit option */
  showEdit?: boolean;
  /** Edit callback */
  onEdit?: () => void;
}

/**
 * Reusable ShippingAddressCard component
 * Displays shipping address information
 */
export function ShippingAddressCard({
  address,
  showEdit = false,
  onEdit,
}: ShippingAddressCardProps) {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl border border-trichomes-forest/10 shadow-sm">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-[18px] sm:text-[20px] font-heading font-semibold text-trichomes-forest">
          Shipping Address
        </h3>
        {showEdit && onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="text-trichomes-primary hover:text-trichomes-forest text-[13px] sm:text-[14px] font-body font-medium transition-colors duration-150"
          >
            Edit
          </button>
        )}
      </div>

      <div className="space-y-2 text-[14px] sm:text-[15px] font-body text-trichomes-forest">
        <p className="font-semibold">
          {address.first_name} {address.last_name}
        </p>
        <p>{address.address_1}</p>
        {address.address_2 && <p>{address.address_2}</p>}
        <p>
          {address.city}
          {address.state && `, ${address.state}`}
          {address.postal_code && ` ${address.postal_code}`}
        </p>
        {address.country && <p>{address.country}</p>}
        {address.phone && (
          <p className="pt-2 text-trichomes-forest/70">
            Phone: {address.phone}
          </p>
        )}
      </div>
    </div>
  );
}

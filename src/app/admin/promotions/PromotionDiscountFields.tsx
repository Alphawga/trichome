"use client";

import type { PromotionDisplayLocation, PromotionType } from "@prisma/client";
import type {
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { canDisplayOnProductTag } from "@/lib/promotions/promotion-display-rules";

interface PromotionDiscountFieldsData {
  type: PromotionType;
  value: number;
  min_order_value: number;
  max_discount?: number;
  display_location: PromotionDisplayLocation;
}

interface PromotionDiscountFieldsProps<T extends PromotionDiscountFieldsData> {
  register: UseFormRegister<T>;
  setValue: UseFormSetValue<T>;
  errors: FieldErrors<T>;
  typeValue: PromotionType;
  valueSlider: number;
  minOrderSlider: number;
  displayLocationValue: PromotionDisplayLocation;
  applicableStateValue: string | undefined;
}

export function PromotionDiscountFields<T extends PromotionDiscountFieldsData>({
  register,
  setValue,
  errors,
  typeValue,
  valueSlider,
  minOrderSlider,
  displayLocationValue,
  applicableStateValue,
}: PromotionDiscountFieldsProps<T>) {
  const typeAllowsProductTag = canDisplayOnProductTag(typeValue);
  const locationBlocksProductTag = !!applicableStateValue;
  return (
    <div className="space-y-4 border-t pt-4">
      <h3 className="text-lg font-semibold">Discount Settings</h3>

      {/* Type */}
      <div>
        <Label className="text-gray-700">
          Discount Type <span className="text-red-500">*</span>
        </Label>
        <Select
          value={typeValue}
          onValueChange={(value: PromotionType) =>
            setValue("type" as never, value as never)
          }
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select discount type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PERCENTAGE">Percentage Off</SelectItem>
            <SelectItem value="FIXED_AMOUNT">Fixed Amount Off</SelectItem>
            <SelectItem value="FREE_SHIPPING">Free Shipping</SelectItem>
            <SelectItem value="BUY_X_GET_Y">Buy X Get Y</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Value with Slider */}
      {typeValue !== "FREE_SHIPPING" && (
        <div>
          <Label htmlFor="value" className="text-gray-700">
            Discount Value <span className="text-red-500">*</span>
          </Label>
          <div className="mt-2 space-y-3">
            <div className="flex items-center gap-4">
              <Slider
                value={[valueSlider]}
                onValueChange={(values) =>
                  setValue("value" as never, values[0] as never)
                }
                min={typeValue === "PERCENTAGE" ? 1 : 100}
                max={typeValue === "PERCENTAGE" ? 100 : 100000}
                step={typeValue === "PERCENTAGE" ? 1 : 100}
                className="flex-1"
              />
              <div className="w-32">
                <Input
                  type="number"
                  {...register("value" as never, {
                    required: "Value is required",
                    min: { value: 0, message: "Value must be positive" },
                    setValueAs: (v) => (v === "" ? undefined : Number(v)),
                  })}
                  className="text-right"
                />
              </div>
            </div>
            <p className="text-sm text-gray-500">
              {typeValue === "PERCENTAGE"
                ? `${valueSlider}% discount`
                : `₦${valueSlider.toLocaleString()} discount`}
            </p>
          </div>
          {errors.value && (
            <p className="text-sm text-red-500 mt-1">
              {errors.value.message as string}
            </p>
          )}
        </div>
      )}

      {/* Min Order Value with Slider */}
      <div>
        <Label htmlFor="min_order_value" className="text-gray-700">
          Minimum Order Value
        </Label>
        <div className="mt-2 space-y-3">
          <div className="flex items-center gap-4">
            <Slider
              value={[minOrderSlider]}
              onValueChange={(values) =>
                setValue("min_order_value" as never, values[0] as never)
              }
              min={0}
              max={500000}
              step={1000}
              className="flex-1"
            />
            <div className="w-32">
              <Input
                type="number"
                {...register("min_order_value" as never, {
                  min: { value: 0, message: "Must be 0 or greater" },
                  setValueAs: (v) => (v === "" ? 0 : Number(v)),
                })}
                className="text-right"
              />
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Minimum: ₦{minOrderSlider.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Max Discount (for percentage) */}
      {typeValue === "PERCENTAGE" && (
        <div>
          <Label htmlFor="max_discount" className="text-gray-700">
            Maximum Discount Amount (Optional)
          </Label>
          <Input
            id="max_discount"
            type="number"
            {...register("max_discount" as never, {
              min: { value: 0, message: "Must be positive" },
              setValueAs: (v) => (v === "" ? undefined : Number(v)),
            })}
            className="mt-1"
            placeholder="e.g., 50000"
          />
          <p className="text-xs text-gray-500 mt-1">
            Cap the maximum discount amount for percentage-based promotions
          </p>
        </div>
      )}

      {/* Display Location — only meaningful for a discount with a per-item
          price to show; FREE_SHIPPING/BUY_X_GET_Y stay checkout-only. */}
      {typeAllowsProductTag && (
        <div>
          <Label className="text-gray-700">Show This Discount</Label>
          <Select
            value={displayLocationValue}
            onValueChange={(value: PromotionDisplayLocation) =>
              setValue("display_location" as never, value as never)
            }
            disabled={locationBlocksProductTag}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select where this displays" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CHECKOUT">Checkout only</SelectItem>
              <SelectItem value="PRODUCT_TAG" disabled={locationBlocksProductTag}>
                Product price tag only
              </SelectItem>
              <SelectItem value="BOTH" disabled={locationBlocksProductTag}>
                Both
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 mt-1">
            {locationBlocksProductTag
              ? "Location-restricted promotions can only show at checkout — the product price tag has no destination to check the restriction against."
              : "Product price tag shows a struck-through original price and the discounted price on every product store-wide, replacing any manually set compare-at price while this promotion is active."}
          </p>
        </div>
      )}
    </div>
  );
}

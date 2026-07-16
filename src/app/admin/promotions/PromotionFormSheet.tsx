"use client";

import type {
  Promotion,
  PromotionStatus,
  PromotionTarget,
  PromotionType,
} from "@prisma/client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/utils/trpc";
import { PromotionDiscountFields } from "./PromotionDiscountFields";

interface PromotionFormSheetProps {
  promotion: Promotion | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  template?: {
    name: string;
    code: string;
    type: PromotionType;
    value: number;
    target: "ALL" | "NEW_CUSTOMERS" | "VIP";
    min_order: number;
  } | null;
}

interface PromotionFormData {
  name: string;
  code?: string;
  description?: string;
  type: PromotionType;
  value: number;
  min_order_value: number;
  max_discount?: number;
  status: PromotionStatus;
  target_customers: PromotionTarget;
  start_date: string;
  end_date: string;
  usage_limit: number;
  usage_limit_per_user?: number;
  show_on_banner: boolean;
}

export function PromotionFormSheet({
  promotion,
  open,
  onOpenChange,
  onSuccess,
  template,
}: PromotionFormSheetProps) {
  const isEdit = !!promotion;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PromotionFormData>({
    defaultValues: {
      type: "PERCENTAGE",
      status: "INACTIVE",
      target_customers: "ALL",
      value: 10,
      min_order_value: 0,
      usage_limit: 100,
      show_on_banner: false,
    },
  });

  const utils = trpc.useUtils();

  const createMutation = trpc.createPromotion.useMutation({
    onSuccess: () => {
      toast.success("Promotion created successfully");
      utils.getPromotions.invalidate();
      utils.getPromotionStats.invalidate();
      onOpenChange(false);
      reset();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Failed to create promotion: ${error.message}`);
    },
  });

  const updateMutation = trpc.updatePromotion.useMutation({
    onSuccess: () => {
      toast.success("Promotion updated successfully");
      utils.getPromotions.invalidate();
      utils.getPromotionStats.invalidate();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Failed to update promotion: ${error.message}`);
    },
  });

  useEffect(() => {
    if (promotion) {
      reset({
        name: promotion.name,
        code: promotion.code || "",
        description: promotion.description || "",
        type: promotion.type,
        value: Number(promotion.value),
        min_order_value: Number(promotion.min_order_value),
        max_discount: promotion.max_discount
          ? Number(promotion.max_discount)
          : undefined,
        status: promotion.status,
        target_customers: promotion.target_customers,
        start_date: new Date(promotion.start_date).toISOString().split("T")[0],
        end_date: new Date(promotion.end_date).toISOString().split("T")[0],
        usage_limit: promotion.usage_limit,
        usage_limit_per_user: promotion.usage_limit_per_user || undefined,
        show_on_banner: promotion.show_on_banner,
      });
    } else if (template) {
      // Pre-fill from template
      const today = new Date();
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      reset({
        name: template.name,
        code: template.code,
        type: template.type,
        value: template.value,
        min_order_value: template.min_order,
        target_customers: template.target,
        status: "INACTIVE",
        usage_limit: 1000,
        start_date: today.toISOString().split("T")[0],
        end_date: nextMonth.toISOString().split("T")[0],
        show_on_banner: false,
      });
    } else {
      reset({
        type: "PERCENTAGE",
        status: "INACTIVE",
        target_customers: "ALL",
        value: 10,
        min_order_value: 0,
        usage_limit: 100,
        show_on_banner: false,
      });
    }
  }, [promotion, template, reset]);

  const onSubmit = async (data: PromotionFormData) => {
    const trimmedCode = data.code?.trim();

    if (isEdit && promotion) {
      await updateMutation.mutateAsync({
        id: promotion.id,
        ...data,
        // Blank input means "make this codeless/auto-apply" — explicitly
        // clear it (null) rather than leaving the existing code unchanged.
        code: trimmedCode || null,
      });
    } else {
      await createMutation.mutateAsync({
        ...data,
        code: trimmedCode || undefined,
      });
    }
  };

  const typeValue = watch("type");
  const statusValue = watch("status");
  const targetValue = watch("target_customers");
  const valueSlider = watch("value") || 10;
  const minOrderSlider = watch("min_order_value") || 0;
  const usageLimitSlider = watch("usage_limit") || 100;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl p-0 overflow-y-auto">
        <SheetHeader className="p-6 border-b">
          <SheetTitle>
            {isEdit ? "Edit Promotion" : "Create New Promotion"}
          </SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Update promotion details and settings"
              : "Set up a new promotional campaign with discount codes"}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>

            {/* Name */}
            <div>
              <Label htmlFor="name" className="text-gray-700">
                Promotion Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                {...register("name", { required: "Name is required" })}
                className="mt-1"
                placeholder="e.g., Summer Sale 2024"
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Code */}
            <div>
              <Label htmlFor="code" className="text-gray-700">
                Promotion Code
              </Label>
              <Input
                id="code"
                {...register("code", {
                  pattern: {
                    value: /^[A-Z0-9]+$/,
                    message: "Code must be uppercase letters and numbers only",
                  },
                })}
                className="mt-1 uppercase"
                placeholder="e.g., SUMMER20"
                maxLength={20}
              />
              {errors.code && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.code.message}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Uppercase letters and numbers only. Leave blank to auto-apply
                this promotion to every eligible customer without a code.
              </p>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="text-gray-700">
                Description
              </Label>
              <Textarea
                id="description"
                {...register("description")}
                className="mt-1"
                placeholder="Describe this promotion..."
                rows={3}
              />
            </div>
          </div>

          <PromotionDiscountFields
            register={register}
            setValue={setValue}
            errors={errors}
            typeValue={typeValue}
            valueSlider={valueSlider}
            minOrderSlider={minOrderSlider}
          />

          {/* Usage Limits */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-semibold">Usage Limits</h3>

            {/* Usage Limit with Slider */}
            <div>
              <Label htmlFor="usage_limit" className="text-gray-700">
                Total Usage Limit <span className="text-red-500">*</span>
              </Label>
              <div className="mt-2 space-y-3">
                <div className="flex items-center gap-4">
                  <Slider
                    value={[usageLimitSlider]}
                    onValueChange={(values) =>
                      setValue("usage_limit", values[0])
                    }
                    min={0}
                    max={10000}
                    step={10}
                    className="flex-1"
                  />
                  <div className="w-32">
                    <Input
                      type="number"
                      {...register("usage_limit", {
                        required: "Usage limit is required",
                        min: { value: 0, message: "Must be 0 or greater" },
                        setValueAs: (v) => (v === "" ? undefined : Number(v)),
                      })}
                      className="text-right"
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  {usageLimitSlider === 0
                    ? "Unlimited uses"
                    : `Limited to ${usageLimitSlider} total uses`}
                </p>
              </div>
            </div>

            {/* Usage Limit Per User */}
            <div>
              <Label htmlFor="usage_limit_per_user" className="text-gray-700">
                Usage Limit Per Customer (Optional)
              </Label>
              <Input
                id="usage_limit_per_user"
                type="number"
                {...register("usage_limit_per_user", {
                  min: { value: 1, message: "Must be at least 1" },
                  setValueAs: (v) => (v === "" ? undefined : Number(v)),
                })}
                className="mt-1"
                placeholder="e.g., 1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty for unlimited per customer
              </p>
            </div>
          </div>

          {/* Schedule & Targeting */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-semibold">Schedule & Targeting</h3>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date" className="text-gray-700">
                  Start Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="start_date"
                  type="date"
                  {...register("start_date", {
                    required: "Start date is required",
                  })}
                  className="mt-1"
                />
                {errors.start_date && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.start_date.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="end_date" className="text-gray-700">
                  End Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="end_date"
                  type="date"
                  {...register("end_date", {
                    required: "End date is required",
                  })}
                  className="mt-1"
                />
                {errors.end_date && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.end_date.message}
                  </p>
                )}
              </div>
            </div>

            {/* Target Customers */}
            <div>
              <Label className="text-gray-700">
                Target Customers <span className="text-red-500">*</span>
              </Label>
              <Select
                value={targetValue}
                onValueChange={(value: PromotionTarget) =>
                  setValue("target_customers", value)
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select target audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Customers</SelectItem>
                  <SelectItem value="NEW_CUSTOMERS">
                    New Customers Only
                  </SelectItem>
                  <SelectItem value="VIP">VIP Customers</SelectItem>
                  <SelectItem value="SPECIFIC_GROUP">Specific Group</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div>
              <Label className="text-gray-700">
                Status <span className="text-red-500">*</span>
              </Label>
              <Select
                value={statusValue}
                onValueChange={(value: PromotionStatus) =>
                  setValue("status", value)
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                {statusValue === "ACTIVE" &&
                  "Promotion is currently active and can be used"}
                {statusValue === "INACTIVE" &&
                  "Promotion is paused and cannot be used"}
                {statusValue === "SCHEDULED" &&
                  "Promotion will activate automatically on start date"}
              </p>
            </div>

            {/* Show on Site Banner */}
            <div>
              <label className="flex items-center">
                <input
                  {...register("show_on_banner")}
                  type="checkbox"
                  className="mr-2 w-4 h-4 text-trichomes-primary focus:ring-trichomes-primary/20 accent-trichomes-primary border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">
                  Show on site banner
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Displays this promotion in the top announcement banner instead
                of the default free shipping message, while it is active and
                within its date range
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#38761d] hover:bg-[#2d5a16] text-white"
            >
              {isSubmitting
                ? "Saving..."
                : isEdit
                  ? "Update Promotion"
                  : "Create Promotion"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

"use client";

import type { User, UserRole, UserStatus } from "@prisma/client";
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
import { trpc } from "@/utils/trpc";

type Customer = Pick<
  User,
  "id" | "email" | "first_name" | "last_name" | "phone" | "status" | "role"
>;

interface CustomerEditSheetProps {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface CustomerFormData {
  first_name: string;
  last_name: string;
  phone: string;
  status: UserStatus;
  role: UserRole;
}

export function CustomerEditSheet({
  customer,
  open,
  onOpenChange,
  onSuccess,
}: CustomerEditSheetProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormData>();

  const utils = trpc.useUtils();
  const updateUserMutation = trpc.updateUser.useMutation({
    onSuccess: () => {
      toast.success("Customer updated successfully");
      utils.getCustomers.invalidate();
      utils.getUserStats.invalidate();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Failed to update customer: ${error.message}`);
    },
  });

  useEffect(() => {
    if (customer) {
      reset({
        first_name: customer.first_name || "",
        last_name: customer.last_name || "",
        phone: customer.phone || "",
        status: customer.status,
        role: customer.role,
      });
    }
  }, [customer, reset]);

  const onSubmit = async (data: CustomerFormData) => {
    if (!customer) return;

    await updateUserMutation.mutateAsync({
      id: customer.id,
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone,
      status: data.status,
      role: data.role,
    });
  };

  if (!customer) return null;

  const statusValue = watch("status");
  const roleValue = watch("role");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg p-0 overflow-y-auto">
        <SheetHeader className="p-6 border-b">
          <SheetTitle>Edit Customer</SheetTitle>
          <SheetDescription>
            Update customer information and account settings
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Customer ID (Read-only) */}
          <div>
            <Label className="text-gray-700">Customer ID</Label>
            <div className="mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-600">
              {customer.id.slice(0, 8)}
            </div>
          </div>

          {/* Email (Read-only) */}
          <div>
            <Label className="text-gray-700">Email</Label>
            <div className="mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-600">
              {customer.email}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Email cannot be changed
            </p>
          </div>

          {/* First Name */}
          <div>
            <Label htmlFor="first_name" className="text-gray-700">
              First Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="first_name"
              {...register("first_name", {
                required: "First name is required",
              })}
              className="mt-1"
              placeholder="Enter first name"
            />
            {errors.first_name && (
              <p className="text-sm text-red-500 mt-1">
                {errors.first_name.message}
              </p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <Label htmlFor="last_name" className="text-gray-700">
              Last Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="last_name"
              {...register("last_name", { required: "Last name is required" })}
              className="mt-1"
              placeholder="Enter last name"
            />
            {errors.last_name && (
              <p className="text-sm text-red-500 mt-1">
                {errors.last_name.message}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <Label htmlFor="phone" className="text-gray-700">
              Phone Number
            </Label>
            <Input
              id="phone"
              {...register("phone")}
              className="mt-1"
              placeholder="Enter phone number"
            />
          </div>

          {/* Status */}
          <div>
            <Label className="text-gray-700">
              Account Status <span className="text-red-500">*</span>
            </Label>
            <Select
              value={statusValue}
              onValueChange={(value: UserStatus) => setValue("status", value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="PENDING_VERIFICATION">
                  Pending Verification
                </SelectItem>
                <SelectItem value="SUSPENDED">Suspended</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              Suspended accounts cannot log in or place orders
            </p>
          </div>

          {/* Role */}
          <div>
            <Label className="text-gray-700">
              User Role <span className="text-red-500">*</span>
            </Label>
            <Select
              value={roleValue}
              onValueChange={(value: UserRole) => setValue("role", value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CUSTOMER">Customer</SelectItem>
                <SelectItem value="STAFF">Staff</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              Changing role affects user permissions and access
            </p>
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
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

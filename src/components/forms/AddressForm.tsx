"use client";

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { z } from "zod";

/**
 * Address Form Schema
 * Matches the schema used in order creation
 */
export const addressFormSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  address_1: z.string().min(1, "Street address is required"),
  address_2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().default("Nigeria"),
});

export type AddressFormData = z.infer<typeof addressFormSchema>;

export interface AddressFormRef {
  validate: () => boolean;
  getData: () => AddressFormData;
  isValid: () => boolean;
}

interface AddressFormProps {
  /** Initial form values */
  initialValues?: Partial<AddressFormData>;
  /** Form submission handler */
  onSubmit?: (data: AddressFormData) => void | Promise<void>;
  /** Form change handler (for controlled components) */
  onChange?: (data: AddressFormData) => void;
  /** Show form in read-only mode */
  readOnly?: boolean;
  /** Show email field (default: true) */
  showEmail?: boolean;
  /** Show address_2 field (default: true) */
  showAddress2?: boolean;
  /** Custom submit button */
  submitButton?: React.ReactNode;
  /** Render as div instead of form (for controlled usage) */
  asDiv?: boolean;
  /** Show validation errors */
  showErrors?: boolean;
  /** Loading state */
  isLoading?: boolean;
  /** Custom class name */
  className?: string;
  /** Form ID for accessibility */
  formId?: string;
  /** Make specific fields read-only */
  readOnlyFields?: Array<keyof AddressFormData>;
}

/**
 * Reusable AddressForm component
 *
 * Provides a consistent address form interface that can be used across:
 * - Checkout page
 * - Profile/Account page (address management)
 * - Order confirmation (read-only)
 *
 * Features:
 * - Full validation with Zod
 * - Error handling and display
 * - Read-only mode support
 * - Type-safe form data
 * - Responsive design
 */
export const AddressForm = React.forwardRef<AddressFormRef, AddressFormProps>(
  function AddressForm(
    {
      initialValues = {},
      onSubmit,
      onChange,
      readOnly = false,
      showEmail = true,
      showAddress2 = true,
      submitButton,
      showErrors = true,
      isLoading = false,
      className = "",
      formId = "address-form",
      asDiv = false,
      readOnlyFields = [],
    },
    ref,
  ) {
    const [formData, setFormData] = useState<AddressFormData>({
      first_name: initialValues.first_name || "",
      last_name: initialValues.last_name || "",
      email: initialValues.email || "",
      phone: initialValues.phone || "",
      address_1: initialValues.address_1 || "",
      address_2: initialValues.address_2 || "",
      city: initialValues.city || "",
      state: initialValues.state || "",
      postal_code: initialValues.postal_code || "",
      country: initialValues.country || "Nigeria",
    });

    const [errors, setErrors] = useState<
      Partial<Record<keyof AddressFormData, string>>
    >({});
    const [touched, setTouched] = useState<
      Partial<Record<keyof AddressFormData, boolean>>
    >({});

    // Update form data when initialValues change (only on mount)
    // Using a ref to track if we've initialized to prevent focus loss
    const initializedRef = React.useRef(false);
    useEffect(() => {
      if (initialValues && !initializedRef.current) {
        setFormData((prev) => ({
          ...prev,
          ...initialValues,
        }));
        initializedRef.current = true;
      }
    }, [initialValues]);

    // Validate field on blur
    const validateField = (field: keyof AddressFormData, value: string) => {
      try {
        const fieldSchema = addressFormSchema.shape[field];
        if (fieldSchema) {
          fieldSchema.parse(value);
        }
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          setErrors((prev) => ({
            ...prev,
            [field]: error.errors[0]?.message || "Invalid value",
          }));
        }
      }
    };

    // Handle input change
    const handleChange = (field: keyof AddressFormData, value: string) => {
      const newData = {
        ...formData,
        [field]: value,
      };
      setFormData(newData);

      // Validate on change if field has been touched
      if (touched[field]) {
        validateField(field, value);
      }

      // Call onChange callback
      if (onChange) {
        onChange(newData);
      }
    };

    // Handle input blur
    const handleBlur = (field: keyof AddressFormData) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      validateField(field, formData[field] as string);
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (readOnly || !onSubmit) return;

      // Validate all fields
      try {
        const validatedData = addressFormSchema.parse(formData);
        setErrors({});
        await onSubmit(validatedData);
      } catch (error) {
        if (error instanceof z.ZodError) {
          const fieldErrors: Partial<Record<keyof AddressFormData, string>> =
            {};
          error.errors.forEach((err) => {
            const field = err.path[0] as keyof AddressFormData;
            if (field) {
              fieldErrors[field] = err.message;
              setTouched((prev) => ({ ...prev, [field]: true }));
            }
          });
          setErrors(fieldErrors);
        }
      }
    };

    // Expose validate function for external use
    const validate = React.useCallback(() => {
      try {
        addressFormSchema.parse(formData);
        setErrors({});
        return true;
      } catch (error) {
        if (error instanceof z.ZodError) {
          const fieldErrors: Partial<Record<keyof AddressFormData, string>> =
            {};
          error.errors.forEach((err) => {
            const field = err.path[0] as keyof AddressFormData;
            if (field) {
              fieldErrors[field] = err.message;
              setTouched((prev) => ({ ...prev, [field]: true }));
            }
          });
          setErrors(fieldErrors);
        }
        return false;
      }
    }, [formData]);

    // Expose form data and validation via ref
    React.useImperativeHandle(
      ref,
      () => ({
        validate,
        getData: () => formData,
        isValid: () => {
          try {
            addressFormSchema.parse(formData);
            return true;
          } catch {
            return false;
          }
        },
      }),
      [formData, validate],
    );

    // Input field component
    const InputField = ({
      id,
      name,
      label,
      type = "text",
      required = false,
      placeholder,
      value,
      onChange,
      onBlur,
      error,
      readOnly: fieldReadOnly = false,
    }: {
      id: string;
      name: keyof AddressFormData;
      label: string;
      type?: string;
      required?: boolean;
      placeholder?: string;
      value: string;
      onChange: (value: string) => void;
      onBlur: () => void;
      error?: string;
      readOnly?: boolean;
    }) => {
      const isReadOnly = readOnly || fieldReadOnly;
      const hasError = showErrors && error && touched[name];

      return (
        <div>
          <label
            htmlFor={id}
            className="block text-[14px] sm:text-[15px] font-medium text-trichomes-forest mb-1 font-body"
          >
            {label}
            {required && !isReadOnly && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </label>
          <input
            type={type}
            id={id}
            name={name}
            required={required && !isReadOnly}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={isReadOnly || isLoading}
            readOnly={isReadOnly}
            className={`w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-trichomes-primary focus:border-trichomes-primary outline-none text-trichomes-forest font-body transition-all duration-150 ${
              hasError
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-trichomes-forest/20"
            } ${isReadOnly ? "bg-trichomes-soft cursor-not-allowed" : ""} ${
              isLoading ? "opacity-50 cursor-wait" : ""
            }`}
          />
          {hasError && (
            <p className="mt-1 text-[12px] sm:text-[13px] text-red-600 font-body">
              {error}
            </p>
          )}
        </div>
      );
    };

    const FormWrapper = asDiv ? "div" : "form";
    const wrapperProps = asDiv
      ? { className }
      : { id: formId, onSubmit: handleSubmit, className };

    return (
      <FormWrapper {...wrapperProps}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* First Name */}
          <InputField
            id={`${formId}-first_name`}
            name="first_name"
            label="First Name"
            required
            placeholder="First name"
            value={formData.first_name}
            onChange={(value) => handleChange("first_name", value)}
            onBlur={() => handleBlur("first_name")}
            error={errors.first_name}
            readOnly={readOnly || readOnlyFields.includes("first_name")}
          />

          {/* Last Name */}
          <InputField
            id={`${formId}-last_name`}
            name="last_name"
            label="Last Name"
            required
            placeholder="Last name"
            value={formData.last_name}
            onChange={(value) => handleChange("last_name", value)}
            onBlur={() => handleBlur("last_name")}
            error={errors.last_name}
            readOnly={readOnly || readOnlyFields.includes("last_name")}
          />

          {/* Email */}
          {showEmail && (
            <InputField
              id={`${formId}-email`}
              name="email"
              label="Email Address"
              type="email"
              required
              placeholder="your@email.com"
              value={formData.email}
              onChange={(value) => handleChange("email", value)}
              onBlur={() => handleBlur("email")}
              error={errors.email}
              readOnly={readOnly || readOnlyFields.includes("email")}
            />
          )}

          {/* Phone */}
          <InputField
            id={`${formId}-phone`}
            name="phone"
            label="Phone Number"
            type="tel"
            placeholder="+234 XXX XXX XXXX"
            value={formData.phone || ""}
            onChange={(value) => handleChange("phone", value)}
            onBlur={() => handleBlur("phone")}
            error={errors.phone}
            readOnly={readOnly}
          />

          {/* Street Address */}
          <div className="sm:col-span-2">
            <InputField
              id={`${formId}-address_1`}
              name="address_1"
              label="Street Address"
              required
              placeholder="Street address"
              value={formData.address_1}
              onChange={(value) => handleChange("address_1", value)}
              onBlur={() => handleBlur("address_1")}
              error={errors.address_1}
              readOnly={readOnly}
            />
          </div>

          {/* Address Line 2 */}
          {showAddress2 && (
            <div className="sm:col-span-2">
              <InputField
                id={`${formId}-address_2`}
                name="address_2"
                label="Address Line 2 (Optional)"
                placeholder="Apartment, suite, etc."
                value={formData.address_2 || ""}
                onChange={(value) => handleChange("address_2", value)}
                onBlur={() => handleBlur("address_2")}
                error={errors.address_2}
                readOnly={readOnly}
              />
            </div>
          )}

          {/* City */}
          <InputField
            id={`${formId}-city`}
            name="city"
            label="City"
            required
            placeholder="City"
            value={formData.city}
            onChange={(value) => handleChange("city", value)}
            onBlur={() => handleBlur("city")}
            error={errors.city}
            readOnly={readOnly}
          />

          {/* State */}
          <InputField
            id={`${formId}-state`}
            name="state"
            label="State"
            placeholder="State"
            value={formData.state || ""}
            onChange={(value) => handleChange("state", value)}
            onBlur={() => handleBlur("state")}
            error={errors.state}
            readOnly={readOnly}
          />

          {/* Postal Code */}
          <InputField
            id={`${formId}-postal_code`}
            name="postal_code"
            label="Postal Code"
            placeholder="Postal code"
            value={formData.postal_code || ""}
            onChange={(value) => handleChange("postal_code", value)}
            onBlur={() => handleBlur("postal_code")}
            error={errors.postal_code}
            readOnly={readOnly}
          />

          {/* Country */}
          <InputField
            id={`${formId}-country`}
            name="country"
            label="Country"
            required
            placeholder="Country"
            value={formData.country}
            onChange={(value) => handleChange("country", value)}
            onBlur={() => handleBlur("country")}
            error={errors.country}
            readOnly={readOnly}
          />
        </div>

        {/* Submit Button */}
        {submitButton && !readOnly && (
          <div className="mt-6">{submitButton}</div>
        )}
      </FormWrapper>
    );
  },
);

/**
 * Hook to get form data and validation state
 */
export function useAddressForm(initialValues?: Partial<AddressFormData>) {
  const [formData, setFormData] = useState<AddressFormData>({
    first_name: initialValues?.first_name || "",
    last_name: initialValues?.last_name || "",
    email: initialValues?.email || "",
    phone: initialValues?.phone || "",
    address_1: initialValues?.address_1 || "",
    address_2: initialValues?.address_2 || "",
    city: initialValues?.city || "",
    state: initialValues?.state || "",
    postal_code: initialValues?.postal_code || "",
    country: initialValues?.country || "Nigeria",
  });

  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    try {
      addressFormSchema.parse(formData);
      setIsValid(true);
    } catch {
      setIsValid(false);
    }
  }, [formData]);

  return {
    formData,
    setFormData,
    isValid,
    validate: () => {
      try {
        addressFormSchema.parse(formData);
        return true;
      } catch {
        return false;
      }
    },
  };
}

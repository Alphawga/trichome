/**
 * Common utility functions for the application
 */

// Currency formatting
export function formatCurrency(
  amount: number,
  currency: string = "NGN",
): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

// Generate unique codes/IDs
export function generateUniqueCode(
  prefix: string = "",
  length: number = 8,
): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = prefix;

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}

// Date formatting
export function formatDate(date: Date, locale: string = "en-NG"): string {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

// Generate order number
export function generateOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TR${timestamp}${random}`;
}

// Generate SKU
export function generateSKU(productName: string, variant?: string): string {
  const cleanName = productName
    .replace(/[^a-zA-Z0-9]/g, "")
    .substring(0, 6)
    .toUpperCase();
  const variantCode = variant
    ? variant
        .replace(/[^a-zA-Z0-9]/g, "")
        .substring(0, 3)
        .toUpperCase()
    : "";
  const randomCode = Math.random().toString(36).substring(2, 5).toUpperCase();

  return `${cleanName}${variantCode}${randomCode}`;
}

// Slug generation
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Email validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Phone number validation (Nigerian format)
export function isValidNigerianPhone(phone: string): boolean {
  const phoneRegex = /^(\+234|234|0)?[789][01]\d{8}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ""));
}

// Format phone number
export function formatNigerianPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");

  if (cleaned.startsWith("234")) {
    return `+${cleaned}`;
  } else if (cleaned.startsWith("0")) {
    return `+234${cleaned.substring(1)}`;
  } else if (cleaned.length === 10) {
    return `+234${cleaned}`;
  }

  return phone;
}

// Calculate percentage
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

// Calculate discount
export function calculateDiscount(
  originalPrice: number,
  discountPercentage: number,
): number {
  return originalPrice * (discountPercentage / 100);
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
}

// Truncate text
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

// Deep clone object
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// Debounce function
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle function
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

// Convert snake_case to camelCase
export function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

// Convert camelCase to snake_case
export function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

// Capitalize first letter
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Generate random hex color
export function generateRandomColor(): string {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
}

// Check if object is empty
export function isEmpty(obj: unknown): boolean {
  if (obj === null || typeof obj !== "object") return false;
  const plain = (obj as { constructor?: unknown }).constructor === Object;
  return plain && Object.keys(obj as Record<string, unknown>).length === 0;
}

// Remove undefined values from object
export function removeUndefined<T extends Record<string, unknown>>(
  obj: T,
): Partial<T> {
  const result: Partial<T> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      result[key as keyof T] = value;
    }
  }

  return result;
}

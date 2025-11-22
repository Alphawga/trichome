/**
 * Password Hashing Utilities
 * Centralized password hashing and verification logic
 *
 * Uses bcryptjs for secure password hashing
 * Follows security best practices:
 * - Salt rounds: 12 (recommended for production)
 * - Never store plain text passwords
 * - Constant-time comparison to prevent timing attacks
 */

import bcrypt from "bcryptjs";

/**
 * Default salt rounds for password hashing
 * 12 rounds is recommended for production (balance between security and performance)
 */
const SALT_ROUNDS = 12;

/**
 * Hash a plain text password
 *
 * @param password - Plain text password to hash
 * @returns Hashed password string
 * @throws Error if hashing fails
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    return hashedPassword;
  } catch (error) {
    console.error("Password hashing error:", error);
    throw new Error("Failed to hash password");
  }
}

/**
 * Verify a plain text password against a hashed password
 *
 * @param password - Plain text password to verify
 * @param hashedPassword - Hashed password to compare against
 * @returns true if password matches, false otherwise
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  try {
    const isValid = await bcrypt.compare(password, hashedPassword);
    return isValid;
  } catch (error) {
    console.error("Password verification error:", error);
    return false;
  }
}

/**
 * Check if a password needs rehashing (e.g., if salt rounds changed)
 *
 * @param hashedPassword - Hashed password to check
 * @returns true if password should be rehashed
 */
export function needsRehash(hashedPassword: string): boolean {
  try {
    // bcrypt hashes start with $2a$, $2b$, or $2y$ followed by rounds
    // If the rounds are less than SALT_ROUNDS, we should rehash
    const rounds = bcrypt.getRounds(hashedPassword);
    return rounds < SALT_ROUNDS;
  } catch (_error) {
    // If we can't parse the hash, assume it needs rehashing
    return true;
  }
}

/**
 * Validate password strength
 *
 * @param password - Password to validate
 * @returns Object with isValid flag and error message if invalid
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  error?: string;
} {
  if (!password) {
    return { isValid: false, error: "Password is required" };
  }

  if (password.length < 8) {
    return {
      isValid: false,
      error: "Password must be at least 8 characters long",
    };
  }

  // Optional: Add more strength requirements
  // if (!/[A-Z]/.test(password)) {
  //   return { isValid: false, error: 'Password must contain at least one uppercase letter' };
  // }
  // if (!/[a-z]/.test(password)) {
  //   return { isValid: false, error: 'Password must contain at least one lowercase letter' };
  // }
  // if (!/[0-9]/.test(password)) {
  //   return { isValid: false, error: 'Password must contain at least one number' };
  // }

  return { isValid: true };
}

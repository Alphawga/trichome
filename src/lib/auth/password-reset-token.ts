/**
 * Password Reset Token Utilities
 *
 * Handles generation, validation, and storage of password reset tokens
 * Uses NextAuth's VerificationToken model for token storage
 */

import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";

/**
 * Token expiration time (1 hour)
 */
const TOKEN_EXPIRATION_HOURS = 1;

/**
 * Generate a secure random token
 */
export function generateResetToken(): string {
  // Generate a cryptographically secure random token
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Create a password reset token for a user
 *
 * @param email - User's email address
 * @returns The generated token
 */
export async function createPasswordResetToken(email: string): Promise<string> {
  // Generate secure token
  const token = generateResetToken();

  // Calculate expiration time
  const expires = new Date();
  expires.setHours(expires.getHours() + TOKEN_EXPIRATION_HOURS);

  // Store token in database using NextAuth's VerificationToken model
  // identifier is the email, token is the reset token
  await prisma.verificationToken.upsert({
    where: {
      identifier_token: {
        identifier: email,
        token: token,
      },
    },
    create: {
      identifier: email,
      token: token,
      expires: expires,
    },
    update: {
      token: token,
      expires: expires,
    },
  });

  return token;
}

/**
 * Validate a password reset token
 *
 * @param email - User's email address
 * @param token - Reset token to validate
 * @returns true if token is valid, false otherwise
 */
export async function validatePasswordResetToken(
  email: string,
  token: string,
): Promise<boolean> {
  try {
    const verificationToken = await prisma.verificationToken.findUnique({
      where: {
        identifier_token: {
          identifier: email,
          token: token,
        },
      },
    });

    if (!verificationToken) {
      return false;
    }

    // Check if token has expired
    if (verificationToken.expires < new Date()) {
      // Delete expired token
      await prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: email,
            token: token,
          },
        },
      });
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error validating password reset token:", error);
    return false;
  }
}

/**
 * Delete a password reset token after use
 *
 * @param email - User's email address
 * @param token - Reset token to delete
 */
export async function deletePasswordResetToken(
  email: string,
  token: string,
): Promise<void> {
  try {
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: email,
          token: token,
        },
      },
    });
  } catch (error) {
    // Token might not exist, which is fine
    console.error("Error deleting password reset token:", error);
  }
}

/**
 * Get token expiration time in hours
 */
export function getTokenExpirationHours(): number {
  return TOKEN_EXPIRATION_HOURS;
}

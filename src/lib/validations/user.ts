import { z } from 'zod';

/**
 * Sign up schema for user registration
 * Includes all fields needed for client-side validation
 */
export const signUpSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Password confirmation is required'),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
  newsletterOptIn: z.boolean().optional().default(false),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

/**
 * Type inference for SignUpInput
 */
export type SignUpInput = z.infer<typeof signUpSchema>;

/**
 * Sign up schema for API registration
 * Excludes client-side only fields (confirmPassword, acceptTerms, newsletterOptIn)
 */
export const signUpApiSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

/**
 * Type inference for SignUpApiInput
 */
export type SignUpApiInput = z.infer<typeof signUpApiSchema>;


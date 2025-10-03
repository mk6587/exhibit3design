import { z } from 'zod';

// Contact form validation
export const contactFormSchema = z.object({
  name: z.string()
    .trim()
    .min(1, { message: "Name is required" })
    .max(100, { message: "Name must be less than 100 characters" }),
  email: z.string()
    .trim()
    .email({ message: "Invalid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  message: z.string()
    .trim()
    .min(1, { message: "Message is required" })
    .max(1000, { message: "Message must be less than 1000 characters" })
});

// Checkout form validation
export const checkoutFormSchema = z.object({
  firstName: z.string()
    .trim()
    .min(1, { message: "First name is required" })
    .max(50, { message: "First name must be less than 50 characters" }),
  lastName: z.string()
    .trim()
    .min(1, { message: "Last name is required" })
    .max(50, { message: "Last name must be less than 50 characters" }),
  email: z.string()
    .trim()
    .email({ message: "Invalid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  mobile: z.string()
    .trim()
    .min(1, { message: "Mobile number is required" })
    .max(20, { message: "Mobile number must be less than 20 characters" })
    .regex(/^[+\d\s()-]+$/, { message: "Invalid mobile number format" }),
  address: z.string()
    .trim()
    .min(1, { message: "Address is required" })
    .max(200, { message: "Address must be less than 200 characters" }),
  city: z.string()
    .trim()
    .min(1, { message: "City is required" })
    .max(100, { message: "City must be less than 100 characters" }),
  postalCode: z.string()
    .trim()
    .min(1, { message: "Postal code is required" })
    .max(20, { message: "Postal code must be less than 20 characters" }),
  country: z.string()
    .trim()
    .min(1, { message: "Country is required" })
    .max(100, { message: "Country must be less than 100 characters" })
});

// Admin login validation
export const adminLoginSchema = z.object({
  email: z.string()
    .trim()
    .email({ message: "Invalid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(100, { message: "Password must be less than 100 characters" })
});

// OTP validation
export const otpSchema = z.object({
  email: z.string()
    .trim()
    .email({ message: "Invalid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  otp: z.string()
    .length(6, { message: "OTP must be exactly 6 digits" })
    .regex(/^\d{6}$/, { message: "OTP must contain only numbers" })
});

// Profile update validation
export const profileUpdateSchema = z.object({
  firstName: z.string()
    .trim()
    .max(50, { message: "First name must be less than 50 characters" })
    .optional(),
  lastName: z.string()
    .trim()
    .max(50, { message: "Last name must be less than 50 characters" })
    .optional(),
  phoneNumber: z.string()
    .trim()
    .max(20, { message: "Phone number must be less than 20 characters" })
    .regex(/^[+\d\s()-]*$/, { message: "Invalid phone number format" })
    .optional(),
  addressLine1: z.string()
    .trim()
    .max(200, { message: "Address must be less than 200 characters" })
    .optional(),
  city: z.string()
    .trim()
    .max(100, { message: "City must be less than 100 characters" })
    .optional(),
  postcode: z.string()
    .trim()
    .max(20, { message: "Postcode must be less than 20 characters" })
    .optional(),
  country: z.string()
    .trim()
    .max(100, { message: "Country must be less than 100 characters" })
    .optional()
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
export type CheckoutFormData = z.infer<typeof checkoutFormSchema>;
export type AdminLoginData = z.infer<typeof adminLoginSchema>;
export type OTPData = z.infer<typeof otpSchema>;
export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;

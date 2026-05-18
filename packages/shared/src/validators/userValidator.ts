import { z } from "zod";

const email = z
  .string()
  .nonempty("Email is required")
  .email("Invalid email format");

const password = z
  .string()
  .nonempty("Password is required")
  .min(8, "Password must be at least 8 characters");

const strongNewPassword = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-z]/, "Must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Must contain at least one uppercase letter")
  .regex(/[0-9]/, "Must contain at least one number")
  .regex(/[@$!%*?&]/, "Must contain at least one special character");

const confirmPassword = z.string().nonempty("Confirm password is required");

export const emailSchema = z.object({
  email: email,
});

export const loginSchema = z.object({
  email: email,
  password: password,
});

export const userUpdateSchema = z.object({
  firstName: z
    .string()
    .nonempty("First name is required")
    .min(2, "First name is too short"),
  lastName: z
    .string()
    .nonempty("Last name is required")
    .min(2, "Last name is too short"),
  email: z.string().email("Invalid email format"),
});

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .nonempty("First name is required")
      .min(2, "First name is too short"),
    lastName: z
      .string()
      .nonempty("Last name is required")
      .min(2, "Last name is too short"),
    email: email,
    password: password,
    confirmPassword: confirmPassword,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: strongNewPassword,
    confirmPassword: confirmPassword,
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const resetPasswordSchema = z
  .object({
    newPassword: strongNewPassword,
    confirmPassword: confirmPassword,
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

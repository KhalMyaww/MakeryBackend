import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  role: z.enum(["customer", "owner"]).default("customer")
});

export type RegisterInput = z.infer<typeof registerSchema>;


export const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi")
});

export type LoginInput = z.infer<typeof loginSchema>;


export const updateProfileSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  phone: z.string().max(20, "Nomor telepon maksimal 20 karakter").nullable().optional()
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Password lama wajib diisi"),
  newPassword: z.string().min(8, "Password baru minimal 8 karakter")
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

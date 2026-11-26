import { z } from "zod";

export const createShopSchema = z.object({
  shop_name: z.string().min(3, "Nama toko minimal 3 karakter"),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  address: z.string().min(5, "Alamat wajib diisi"),
  city: z.string().min(2, "Kota wajib diisi"),
  phone: z.string().min(8, "Nomor telepon tidak valid").max(20)
});

export type CreateShopInput = z.infer<typeof createShopSchema>;


export const updateShopSchema = z.object({
  shop_name: z.string().min(3, "Nama toko minimal 3 karakter"),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  address: z.string().min(5, "Alamat wajib diisi"),
  city: z.string().min(2, "Kota wajib diisi"),
  phone: z.string().min(8, "Nomor telepon tidak valid").max(20)
});

export type UpdateShopInput = z.infer<typeof updateShopSchema>;


export const verifyShopSchema = z.object({
  verification_status: z.enum(["approved", "rejected"])
});

export type VerifyShopInput = z.infer<typeof verifyShopSchema>;
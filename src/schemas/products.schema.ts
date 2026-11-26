import { z } from "zod";

export const createProductSchema = z.object({
  category_id: z.number().int().positive(),
  name: z.string().min(3, "Nama produk minimal 3 karakter"),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  price: z.number().positive("Harga harus lebih dari 0"),
  material: z.string().min(2),
  size: z.string().min(1),
  color: z.string().min(1),
  stock: z.number().int().min(0),
  image_url: z.string().url().nullable().optional()
});

export const updateProductSchema = createProductSchema;

export const updateProductAvailabilitySchema = z.object({
  is_available: z.boolean()
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
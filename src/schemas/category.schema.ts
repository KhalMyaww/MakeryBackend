import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(3, "Nama kategori minimal 3 karakter"),
  description: z.string().optional()
});

export const updateCategorySchema = z.object({
  name: z.string().min(3, "Nama kategori minimal 3 karakter"),
  description: z.string().optional()
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
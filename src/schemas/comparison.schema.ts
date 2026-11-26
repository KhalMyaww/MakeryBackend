import { z } from "zod";

export const comparisonProductSchema = z.object({
  product_id: z.number().int().positive()
});

export type ComparisonProductInput = z.infer<
  typeof comparisonProductSchema
>;
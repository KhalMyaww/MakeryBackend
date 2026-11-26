import { z } from "zod";

export const createOrderSchema = z.object({
  shop_id: z.number().int().positive(),

  recipient_name: z.string().min(2),
  recipient_phone: z.string().min(8).max(20),

  delivery_type: z.enum(["delivery", "pickup"]),

  delivery_address: z.string().min(5).nullable().optional(),

  notes: z.string().max(500).nullable().optional(),

  items: z.array(
    z.object({
      product_id: z.number().int().positive(),
      quantity: z.number().int().positive()
    })
  ).min(1, "Pesanan harus memiliki minimal satu produk")
}).superRefine((data, ctx) => {
  if (data.delivery_type === "delivery" && !data.delivery_address?.trim()) {
    ctx.addIssue({
      code: "custom",
      path: ["delivery_address"],
      message: "Alamat pengiriman wajib diisi"
    });
  }

  const productIds = data.items.map((item) => item.product_id);

  if (new Set(productIds).size !== productIds.length) {
    ctx.addIssue({
      code: "custom",
      path: ["items"],
      message: "Produk yang sama tidak boleh dimasukkan lebih dari sekali"
    });
  }
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "confirmed",
    "processing",
    "ready",
    "delivering",
    "completed",
    "cancelled"
  ])
});

export type UpdateOrderStatusInput = z.infer<
  typeof updateOrderStatusSchema
>;
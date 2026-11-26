import type { Request, Response } from "express";
import { createOrderSchema } from "../schemas/order.schema.ts";
import { updateOrderStatusSchema } from "../schemas/order.schema.ts";
import {
  createOrder,
  getCustomerOrders,
  getOwnerOrders,
  getOrderDetail,
  updateOrderStatus
} from "../services/order.service.ts";

export async function createOrderController(
  req: Request,
  res: Response
) {
  try {
    const validation = createOrderSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        message: "Data pesanan tidak valid",
        errors: validation.error.flatten().fieldErrors
      });
    }

    const order = await createOrder(req.user!.id, validation.data);

    return res.status(201).json({
      message: "Pesanan berhasil dibuat",
      data: order
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "SHOP_NOT_AVAILABLE") {
        return res.status(404).json({
          message: "Toko tidak ditemukan atau belum disetujui"
        });
      }

      if (error.message === "PRODUCT_NOT_FOUND") {
        return res.status(404).json({
          message: "Produk tidak ditemukan di toko tersebut"
        });
      }

      if (error.message === "INSUFFICIENT_STOCK") {
        return res.status(409).json({
          message: "Stok produk tidak mencukupi atau produk tidak tersedia"
        });
      }
    }

    console.error("Create order error:", error);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server"
    });
  }
}

export async function getMyOrders(req: Request, res: Response) {
  try {
    const orders = await getCustomerOrders(req.user!.id);

    return res.status(200).json({
      message: "Berhasil mengambil riwayat pesanan",
      data: orders
    });
  } catch (error) {
    console.error("Get customer orders error:", error);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server"
    });
  }
}

export async function getIncomingOrders(req: Request, res: Response) {
  try {
    const orders = await getOwnerOrders(req.user!.id);

    return res.status(200).json({
      message: "Berhasil mengambil pesanan toko",
      data: orders
    });
  } catch (error) {
    console.error("Get owner orders error:", error);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server"
    });
  }
}

export async function getOrderDetailController(
  req: Request,
  res: Response
) {
  try {
    const orderId = Number(req.params.id);

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return res.status(400).json({
        message: "ID pesanan tidak valid"
      });
    }

    const role = req.user!.role;

    if (role !== "customer" && role !== "owner") {
      return res.status(403).json({
        message: "Kamu tidak memiliki akses"
      });
    }

    const order = await getOrderDetail(
      orderId,
      req.user!.id,
      role
    );

    if (!order) {
      return res.status(404).json({
        message: "Pesanan tidak ditemukan"
      });
    }

    return res.status(200).json({
      message: "Berhasil mengambil detail pesanan",
      data: order
    });
  } catch (error) {
    console.error("Get order detail error:", error);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server"
    });
  }
}

export async function updateOrderStatusController(
  req: Request,
  res: Response
) {
  try {
    const orderId = Number(req.params.id);

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return res.status(400).json({
        message: "ID pesanan tidak valid"
      });
    }

    const validation = updateOrderStatusSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        message: "Status pesanan tidak valid",
        errors: validation.error.flatten().fieldErrors
      });
    }

    const order = await updateOrderStatus(
      req.user!.id,
      orderId,
      validation.data.status
    );

    return res.status(200).json({
      message: "Status pesanan berhasil diperbarui",
      data: order
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "ORDER_NOT_FOUND") {
        return res.status(404).json({
          message: "Pesanan tidak ditemukan"
        });
      }

      if (error.message === "INVALID_STATUS_TRANSITION") {
        return res.status(400).json({
          message: "Perubahan status pesanan tidak diperbolehkan"
        });
      }
    }

    console.error("Update order status error:", error);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server"
    });
  }
}

import type { Request, Response } from "express";
import {
  getCustomerDashboard,
  getOwnerDashboard,
  getAdminDashboard
} from "../services/dashboard.service.ts";

export async function getDashboard(req: Request, res: Response) {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        message: "Silakan login terlebih dahulu"
      });
    }

    let dashboard;

    if (user.role === "customer") {
      dashboard = await getCustomerDashboard(user.id);
    } else if (user.role === "owner") {
      dashboard = await getOwnerDashboard(user.id);
    } else if (user.role === "admin") {
      dashboard = await getAdminDashboard();
    } else {
      return res.status(403).json({
        message: "Role tidak memiliki akses dashboard"
      });
    }

    return res.status(200).json({
      message: "Berhasil mengambil data dashboard",
      data: dashboard
    });
  } catch (error) {
    console.error("Get dashboard error:", error);

    if (error instanceof Error && error.message === "SHOP_NOT_FOUND") {
      return res.status(404).json({
        message: "Toko belum tersedia"
      });
    }

    return res.status(500).json({
      message: "Gagal mengambil data dashboard"
    });
  }
}

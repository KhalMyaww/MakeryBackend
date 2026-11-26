import type { Request, Response } from "express";
import {
  createShopSchema,
  updateShopSchema,
  verifyShopSchema
} from "../schemas/shop.schema.ts";

import {
  createShop,
  getShopByOwner,
  updateShop,
  getApprovedShops,
  getApprovedShopById,
  getPendingShops,
  verifyShop
} from "../services/shop.service.ts";

export async function createShopController(
  req: Request,
  res: Response
) {
  try {
    const validation = createShopSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        message: "Data toko tidak valid",
        errors: validation.error.flatten().fieldErrors
      });
    }

    const shop = await createShop(req.user!.id, validation.data);

    return res.status(201).json({
      message: "Toko berhasil dibuat dan menunggu verifikasi admin",
      data: shop
    });
  } catch (error) {
    if (error instanceof Error && error.message === "OWNER_ALREADY_HAS_SHOP") {
      return res.status(409).json({
        message: "Kamu sudah memiliki toko"
      });
    }

    console.error("Create shop error:", error);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server"
    });
  }
}

export async function getMyShop(req: Request, res: Response) {
  try {
    const shop = await getShopByOwner(req.user!.id);

    if (!shop) {
      return res.status(404).json({
        message: "Kamu belum memiliki toko"
      });
    }

    return res.status(200).json({
      message: "Berhasil mengambil data toko",
      data: shop
    });
  } catch (error) {
    console.error("Get my shop error:", error);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server"
    });
  }
}

export async function updateMyShop(req: Request, res: Response) {
  try {
    const validation = updateShopSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        message: "Data toko tidak valid",
        errors: validation.error.flatten().fieldErrors
      });
    }

    const shop = await updateShop(req.user!.id, validation.data);

    if (!shop) {
      return res.status(404).json({
        message: "Toko tidak ditemukan"
      });
    }

    return res.status(200).json({
      message: "Informasi toko berhasil diperbarui",
      data: shop
    });
  } catch (error) {
    console.error("Update shop error:", error);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server"
    });
  }
}

export async function getPublicShops(req: Request, res: Response) {
  try {
    const shops = await getApprovedShops();

    return res.status(200).json({
      message: "Berhasil mengambil daftar toko",
      data: shops
    });
  } catch (error) {
    console.error("Get public shops error:", error);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server"
    });
  }
}

export async function getPublicShopDetail(req: Request, res: Response) {
  try {
    const shopId = Number(req.params.id);

    if (!Number.isInteger(shopId) || shopId <= 0) {
      return res.status(400).json({
        message: "ID toko tidak valid"
      });
    }

    const shop = await getApprovedShopById(shopId);

    if (!shop) {
      return res.status(404).json({
        message: "Toko tidak ditemukan"
      });
    }

    return res.status(200).json({
      message: "Berhasil mengambil detail toko",
      data: shop
    });
  } catch (error) {
    console.error("Get public shop detail error:", error);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server"
    });
  }
}

// Admin: mengambil daftar toko yang menunggu verifikasi
export async function getPendingShopsController(
  req: Request,
  res: Response
) {
  try {
    const shops = await getPendingShops();

    return res.status(200).json({
      message: "Berhasil mengambil daftar toko pending",
      data: shops
    });
  } catch (error) {
    console.error("Get pending shops error:", error);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server"
    });
  }
}

// Admin: menyetujui atau menolak toko
export async function verifyShopController(
  req: Request,
  res: Response
) {
  try {
    const shopId = Number(req.params.id);

    if (!Number.isInteger(shopId) || shopId <= 0) {
      return res.status(400).json({
        message: "ID toko tidak valid"
      });
    }

    const validation = verifyShopSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        message: "Status verifikasi tidak valid",
        errors: validation.error.flatten().fieldErrors
      });
    }

    const updated = await verifyShop(
      shopId,
      validation.data.verification_status
    );

    if (!updated) {
      return res.status(404).json({
        message: "Toko tidak ditemukan atau sudah diverifikasi"
      });
    }

    return res.status(200).json({
      message: validation.data.verification_status === "approved"
        ? "Toko berhasil disetujui"
        : "Toko berhasil ditolak"
    });
  } catch (error) {
    console.error("Verify shop error:", error);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server"
    });
  }
}
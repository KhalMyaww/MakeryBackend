import type { Request, Response } from "express";

import { comparisonProductSchema } from "../schemas/comparison.schema.ts";

import {
  getCustomerComparisons,
  addProductComparison,
  removeProductComparison
} from "../services/comparison.service.ts";

export async function getMyComparisons(
  req: Request,
  res: Response
) {
  try {
    const comparisons = await getCustomerComparisons(req.user!.id);

    return res.status(200).json({
      message: "Berhasil mengambil daftar perbandingan produk",
      data: comparisons
    });
  } catch (error) {
    console.error("Get comparisons error:", error);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server"
    });
  }
}

export async function addComparisonController(
  req: Request,
  res: Response
) {
  try {
    const validation = comparisonProductSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        message: "Data produk tidak valid",
        errors: validation.error.flatten().fieldErrors
      });
    }

    const comparisonId = await addProductComparison(
      req.user!.id,
      validation.data.product_id
    );

    return res.status(201).json({
      message: "Produk berhasil ditambahkan ke perbandingan",
      data: {
        id: comparisonId,
        product_id: validation.data.product_id
      }
    });
  } catch (error) {
    if (error instanceof Error && error.message === "PRODUCT_NOT_AVAILABLE") {
      return res.status(404).json({
        message: "Produk tidak ditemukan atau tidak tersedia"
      });
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ER_DUP_ENTRY"
    ) {
      return res.status(409).json({
        message: "Produk sudah ada dalam daftar perbandingan"
      });
    }

    console.error("Add comparison error:", error);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server"
    });
  }
}

export async function removeComparisonController(
  req: Request,
  res: Response
) {
  try {
    const productId = Number(req.params.productId);

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        message: "ID produk tidak valid"
      });
    }

    const removed = await removeProductComparison(
      req.user!.id,
      productId
    );

    if (!removed) {
      return res.status(404).json({
        message: "Produk tidak ditemukan dalam daftar perbandingan"
      });
    }

    return res.status(200).json({
      message: "Produk berhasil dihapus dari perbandingan"
    });
  } catch (error) {
    console.error("Remove comparison error:", error);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server"
    });
  }
}
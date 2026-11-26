import type { Request, Response } from "express";

import {
  createProductSchema,
  updateProductSchema
} from "../schemas/product.schema.ts";

import {
  getAllProducts,
  getProductById,
  getProductsByShop,
  createProduct,
  updateProduct,
  deleteProduct
} from "../services/product.service.ts";

export async function getProducts(req: Request, res: Response) {
  try {
    const products = await getAllProducts();

    return res.status(200).json({
      message: "Berhasil mengambil daftar produk",
      data: products
    });
  } catch (error) {
    console.error("Get products error:", error);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server"
    });
  }
}

export async function getProductDetail(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "ID produk tidak valid"
      });
    }

    const product = await getProductById(id);

    if (!product) {
      return res.status(404).json({
        message: "Produk tidak ditemukan"
      });
    }

    return res.status(200).json({
      message: "Berhasil mengambil detail produk",
      data: product
    });
  } catch (error) {
    console.error("Get product detail error:", error);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server"
    });
  }
}

export async function getMyProducts(req: Request, res: Response) {
  try {
    const products = await getProductsByShop(req.user!.id);

    return res.status(200).json({
      message: "Berhasil mengambil produk toko",
      data: products
    });
  } catch (error) {
    console.error("Get my products error:", error);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server"
    });
  }
}

export async function createProductController(
  req: Request,
  res: Response
) {
  try {
    const validation = createProductSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        message: "Data produk tidak valid",
        errors: validation.error.flatten().fieldErrors
      });
    }

    const product = await createProduct(req.user!.id, validation.data);

    return res.status(201).json({
      message: "Produk berhasil ditambahkan",
      data: product
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "SHOP_NOT_FOUND") {
        return res.status(404).json({
          message: "Kamu belum memiliki toko"
        });
      }

      if (error.message === "SHOP_NOT_APPROVED") {
        return res.status(403).json({
          message: "Toko kamu belum disetujui admin"
        });
      }

      if (error.message === "CATEGORY_NOT_FOUND") {
        return res.status(404).json({
          message: "Kategori tidak ditemukan"
        });
      }
    }

    console.error("Create product error:", error);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server"
    });
  }
}

export async function updateProductController(
  req: Request,
  res: Response
) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "ID produk tidak valid"
      });
    }

    const validation = updateProductSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        message: "Data produk tidak valid",
        errors: validation.error.flatten().fieldErrors
      });
    }

    const product = await updateProduct(
      req.user!.id,
      id,
      validation.data
    );

    if (!product) {
      return res.status(404).json({
        message: "Produk tidak ditemukan"
      });
    }

    return res.status(200).json({
      message: "Produk berhasil diperbarui",
      data: product
    });
  } catch (error) {
    console.error("Update product error:", error);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server"
    });
  }
}

export async function deleteProductController(
  req: Request,
  res: Response
) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "ID produk tidak valid"
      });
    }

    const deleted = await deleteProduct(req.user!.id, id);

    if (!deleted) {
      return res.status(404).json({
        message: "Produk tidak ditemukan"
      });
    }

    return res.status(200).json({
      message: "Produk berhasil dihapus"
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ER_ROW_IS_REFERENCED_2"
    ) {
      return res.status(409).json({
        message: "Produk tidak bisa dihapus karena sudah digunakan dalam pesanan"
      });
    }

    console.error("Delete product error:", error);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server"
    });
  }
}
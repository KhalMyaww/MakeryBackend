import type { Request, Response } from "express";

import {
  createCategorySchema,
  updateCategorySchema
} from "../schemas/category.schema.ts";

import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} from "../services/category.service.ts";

export async function getCategories(req: Request, res: Response) {
  try {
    const categories = await getAllCategories();

    return res.status(200).json({
      message: "Berhasil mengambil daftar kategori",
      data: categories
    });
  } catch (error) {
    console.error("Get categories error:", error);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server"
    });
  }
}

export async function getCategoryDetail(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "ID kategori tidak valid"
      });
    }

    const category = await getCategoryById(id);

    if (!category) {
      return res.status(404).json({
        message: "Kategori tidak ditemukan"
      });
    }

    return res.status(200).json({
      message: "Berhasil mengambil detail kategori",
      data: category
    });
  } catch (error) {
    console.error("Get category detail error:", error);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server"
    });
  }
}

export async function createCategoryController(req: Request, res: Response) {
  try {
    const validation = createCategorySchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        message: "Data kategori tidak valid",
        errors: validation.error.flatten().fieldErrors
      });
    }

    const category = await createCategory(validation.data);

    return res.status(201).json({
      message: "Kategori berhasil ditambahkan",
      data: category
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ER_DUP_ENTRY"
    ) {
      return res.status(409).json({
        message: "Nama kategori sudah digunakan"
      });
    }

    console.error("Create category error:", error);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server"
    });
  }
}

export async function updateCategoryController(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "ID kategori tidak valid"
      });
    }

    const validation = updateCategorySchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        message: "Data kategori tidak valid",
        errors: validation.error.flatten().fieldErrors
      });
    }

    const category = await updateCategory(id, validation.data);

    if (!category) {
      return res.status(404).json({
        message: "Kategori tidak ditemukan"
      });
    }

    return res.status(200).json({
      message: "Kategori berhasil diperbarui",
      data: category
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ER_DUP_ENTRY"
    ) {
      return res.status(409).json({
        message: "Nama kategori sudah digunakan"
      });
    }

    console.error("Update category error:", error);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server"
    });
  }
}

export async function deleteCategoryController(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "ID kategori tidak valid"
      });
    }

    const deleted = await deleteCategory(id);

    if (!deleted) {
      return res.status(404).json({
        message: "Kategori tidak ditemukan"
      });
    }

    return res.status(200).json({
      message: "Kategori berhasil dihapus"
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ER_ROW_IS_REFERENCED_2"
    ) {
      return res.status(409).json({
        message: "Kategori tidak bisa dihapus karena masih digunakan produk"
      });
    }

    console.error("Delete category error:", error);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server"
    });
  }
}
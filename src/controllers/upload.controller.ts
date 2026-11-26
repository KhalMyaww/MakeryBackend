import type { Request, Response } from "express";
import { uploadProductImage } from "../services/upload.service.ts";
import { uploadProfileImage } from "../services/upload.service.ts";
import { updateProfileImage } from "../services/auth.service.ts";

export async function uploadProductImageController(
  req: Request,
  res: Response
) {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Pilih gambar terlebih dahulu"
      });
    }

    const result = await uploadProductImage(req.file);

    return res.status(201).json({
      message: "Gambar produk berhasil diunggah",
      data: result
    });
  } catch (error) {
    console.error("Upload product image error:", error);

    return res.status(500).json({
      message: "Gagal mengunggah gambar"
    });
  }
}

export async function uploadProfileImageController(
  req: Request,
  res: Response
) {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Pilih foto profil terlebih dahulu"
      });
    }

    const result = await uploadProfileImage(req.file);

    const profile = await updateProfileImage(
      req.user!.id,
      result.url
    );

    return res.status(200).json({
      message: "Foto profil berhasil diperbarui",
      data: profile
    });
  } catch (error) {
    console.error("Upload profile image error:", error);

    return res.status(500).json({
      message: "Gagal memperbarui foto profil"
    });
  }
}
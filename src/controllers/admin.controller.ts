
import type { Request, Response } from "express";
import {
  getAllUsers,
  getUserDetail,
  deleteUser,
  getAllShopsAdmin
} from "../services/admin.service.ts";

export async function getUsers(req: Request, res: Response) {
  try {
    const users = await getAllUsers();

    return res.status(200).json({
      message: "Berhasil mengambil daftar pengguna",
      data: users
    });
  } catch (error) {
    console.error("Get users error:", error);

    return res.status(500).json({
      message: "Gagal mengambil daftar pengguna"
    });
  }
}

export async function getUserDetailController(req: Request, res: Response) {
  try {
    const userId = Number(req.params.id);

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({
        message: "ID pengguna tidak valid"
      });
    }

    const user = await getUserDetail(userId);

    if (!user) {
      return res.status(404).json({
        message: "Pengguna tidak ditemukan"
      });
    }

    return res.status(200).json({
      message: "Berhasil mengambil detail pengguna",
      data: user
    });
  } catch (error) {
    console.error("Get user detail error:", error);

    return res.status(500).json({
      message: "Gagal mengambil detail pengguna"
    });
  }
}

export async function deleteUserController(req: Request, res: Response) {
  try {
    const userId = Number(req.params.id);
    const adminId = req.user!.id;

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({
        message: "ID pengguna tidak valid"
      });
    }

    await deleteUser(userId, adminId);

    return res.status(200).json({
      message: "Berhasil menghapus pengguna"
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "USER_NOT_FOUND") {
        return res.status(404).json({ message: "Pengguna tidak ditemukan" });
      }

      if (error.message === "CANNOT_DELETE_SELF") {
        return res.status(400).json({ message: "Admin tidak dapat menghapus akun sendiri" });
      }

      if (error.message === "CANNOT_DELETE_ADMIN") {
        return res.status(403).json({ message: "Akun admin tidak dapat dihapus melalui fitur ini" });
      }
    }

    console.error("Delete user error:", error);

    return res.status(500).json({
      message: "Gagal menghapus pengguna. Data pengguna mungkin masih terhubung dengan pesanan atau toko."
    });
  }
}

export async function getAdminShops(req: Request, res: Response) {
  try {
    const shops = await getAllShopsAdmin();

    return res.status(200).json({
      message: "Berhasil mengambil daftar toko",
      data: shops
    });
  } catch (error) {
    console.error("Get admin shops error:", error);

    return res.status(500).json({
      message: "Gagal mengambil daftar toko"
    });
  }
}

import type { Request, Response } from "express";
import { registerSchema } from "../schemas/auth.schema.ts";
import { registerUser } from "../services/auth.service.ts";
import { loginSchema } from "../schemas/auth.schema.ts";
import { loginUser } from "../services/auth.service.ts";
import { updateProfileSchema, changePasswordSchema } from "../schemas/auth.schema.ts";
import { getUserProfile, updateUserProfile, changeUserPassword } from "../services/auth.service.ts";

export async function register(req: Request, res: Response) {
  try {
    const validation = registerSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        message: "Data registrasi tidak valid",
        errors: validation.error.flatten().fieldErrors
      });
    }

    const user = await registerUser(validation.data);

    return res.status(201).json({
      message: "Registrasi berhasil",
      data: user
    });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ER_DUP_ENTRY"
    ) {
      return res.status(409).json({
        message: "Email sudah terdaftar"
      });
    }

    console.error("Register error:", error);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server"
    });
  }
}


export async function login(req: Request, res: Response) {
  try {
    const validation = loginSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        message: "Data login tidak valid",
        errors: validation.error.flatten().fieldErrors
      });
    }

    const result = await loginUser(validation.data);

    if (!result) {
      return res.status(401).json({
        message: "Email atau password salah"
      });
    }

    return res.status(200).json({
      message: "Login berhasil",
      data: result
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server"
    });
  }
}


export async function getProfile(req: Request, res: Response) {
  try {
    const user = await getUserProfile(req.user!.id);

    if (!user) {
      return res.status(404).json({
        message: "Pengguna tidak ditemukan"
      });
    }

    return res.status(200).json({
      message: "Berhasil mengambil profil",
      data: user
    });
  } catch (error) {
    console.error("Get profile error:", error);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server"
    });
  }
}

export async function updateProfile(req: Request, res: Response) {
  try {
    const validation = updateProfileSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        message: "Data profil tidak valid",
        errors: validation.error.flatten().fieldErrors
      });
    }

    const user = await updateUserProfile(
      req.user!.id,
      validation.data
    );

    if (!user) {
      return res.status(404).json({
        message: "Pengguna tidak ditemukan"
      });
    }

    return res.status(200).json({
      message: "Profil berhasil diperbarui",
      data: user
    });
  } catch (error) {
    console.error("Update profile error:", error);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server"
    });
  }
}

export async function changePassword(req: Request, res: Response) {
  try {
    const validation = changePasswordSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        message: "Data password tidak valid",
        errors: validation.error.flatten().fieldErrors
      });
    }

    const success = await changeUserPassword(
      req.user!.id,
      validation.data
    );

    if (!success) {
      return res.status(400).json({
        message: "Password lama salah atau akun tidak ditemukan"
      });
    }

    return res.status(200).json({
      message: "Password berhasil diubah"
    });
  } catch (error) {
    console.error("Change password error:", error);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server"
    });
  }
}

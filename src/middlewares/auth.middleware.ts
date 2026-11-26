
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const allowedRoles = ["customer", "owner", "admin"] as const;

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Token tidak ditemukan. Silakan login."
      });
    }

    const token = authorization.split(" ")[1];
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("JWT_SECRET belum diatur");
    }

    const decoded = jwt.verify(token, secret);

    if (
      typeof decoded !== "object" ||
      !("id" in decoded) ||
      !("email" in decoded) ||
      !("role" in decoded) ||
      typeof decoded.id !== "number" ||
      typeof decoded.email !== "string" ||
      !allowedRoles.includes(
        decoded.role as typeof allowedRoles[number]
      )
    ) {
      return res.status(401).json({
        message: "Token tidak valid"
      });
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role as typeof allowedRoles[number]
    };

    next();
  } catch {
    return res.status(401).json({
      message: "Token tidak valid atau sudah kedaluwarsa"
    });
  }
}

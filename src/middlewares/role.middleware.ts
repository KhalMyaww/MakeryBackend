
import type { Request, Response, NextFunction } from "express";

type UserRole = "customer" | "owner" | "admin";

export function authorize(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Silakan login terlebih dahulu"
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Kamu tidak memiliki akses ke fitur ini"
      });
    }

    next();
  };
}

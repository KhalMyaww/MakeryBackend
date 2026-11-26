import jwt from "jsonwebtoken";

export function generateToken(payload: {
  id: number;
  email: string;
  role: string;
}) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET belum diatur");
  }

  return jwt.sign(payload, secret, {
    expiresIn: (process.env.JWT_EXPIRES_IN || "1d") as "1d"
  });
}

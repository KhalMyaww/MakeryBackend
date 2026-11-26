import bcrypt from "bcrypt";
import pool from "../config/database.ts";
import type { RegisterInput } from "../schemas/auth.schema.ts";
import { generateToken } from "../utils/jwt.ts";
import type { LoginInput } from "../schemas/auth.schema.ts";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import type { UpdateProfileInput, ChangePasswordInput } from "../schemas/auth.schema.ts";


export async function registerUser(data: RegisterInput) {
  const hashedPassword = await bcrypt.hash(data.password, 10);

  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO users (name, email, password, role)
     VALUES (?, ?, ?, ?)`,
    [
      data.name,
      data.email,
      hashedPassword,
      data.role
    ]
  );

  return {
    id: result.insertId,
    name: data.name,
    email: data.email,
    role: data.role
  };
}


export async function loginUser(data: LoginInput) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT id, name, email, password, role
     FROM users
     WHERE email = ?`,
    [data.email]
  );

  if (rows.length === 0) {
    return null;
  }

  const user = rows[0];

  const isPasswordValid = await bcrypt.compare(
    data.password,
    user.password
  );

  if (!isPasswordValid) {
    return null;
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
}


export async function getUserProfile(userId: number) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT id, name, email, phone, profile_image, role,
            created_at, updated_at
     FROM users
     WHERE id = ?`,
    [userId]
  );

  return rows[0] ?? null;
}

export async function updateUserProfile(
  userId: number,
  data: UpdateProfileInput
) {
  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE users
     SET name = ?, phone = ?
     WHERE id = ?`,
    [data.name, data.phone ?? null, userId]
  );

  if (result.affectedRows === 0) {
    return null;
  }

  return getUserProfile(userId);
}

export async function changeUserPassword(
  userId: number,
  data: ChangePasswordInput
) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT password
     FROM users
     WHERE id = ?`,
    [userId]
  );

  if (rows.length === 0) {
    return false;
  }

  const isPasswordValid = await bcrypt.compare(
    data.oldPassword,
    rows[0].password
  );

  if (!isPasswordValid) {
    return false;
  }

  const hashedPassword = await bcrypt.hash(data.newPassword, 10);

  await pool.execute(
    `UPDATE users
     SET password = ?
     WHERE id = ?`,
    [hashedPassword, userId]
  );

  return true;
}

export async function updateProfileImage(
  userId: number,
  imageUrl: string
) {
  await pool.execute(
    `UPDATE users
    SET profile_image = ?
    WHERE id = ?`,
    [imageUrl, userId]
  );

  return getUserProfile(userId);
} 
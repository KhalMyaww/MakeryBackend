
import pool from "../config/database.ts";
import type { RowDataPacket } from "mysql2/promise";

export async function getAllUsers() {
  const [users] = await pool.execute<RowDataPacket[]>(
    `SELECT
      id,
      name,
      email,
      phone,
      profile_image,
      role,
      created_at
    FROM users
    ORDER BY created_at DESC`
  );

  return users;
}

export async function getUserDetail(userId: number) {
  const [users] = await pool.execute<RowDataPacket[]>(
    `SELECT
      id,
      name,
      email,
      phone,
      profile_image,
      role,
      created_at,
      updated_at
    FROM users
    WHERE id = ?`,
    [userId]
  );

  return users[0] ?? null;
}

export async function deleteUser(userId: number, adminId: number) {
  if (userId === adminId) {
    throw new Error("CANNOT_DELETE_SELF");
  }

  const [users] = await pool.execute<RowDataPacket[]>(
    `SELECT id, role
    FROM users
    WHERE id = ?`,
    [userId]
  );

  if (users.length === 0) {
    throw new Error("USER_NOT_FOUND");
  }

  if (users[0].role === "admin") {
    throw new Error("CANNOT_DELETE_ADMIN");
  }

  await pool.execute(
    `DELETE FROM users
    WHERE id = ?`,
    [userId]
  );
}

export async function getAllShopsAdmin() {
  const [shops] = await pool.execute<RowDataPacket[]>(
    `SELECT
      s.id,
      s.shop_name,
      s.description,
      s.address,
      s.city,
      s.phone,
      s.shop_image,
      s.verification_status,
      s.created_at,
      u.name AS owner_name,
      u.email AS owner_email
    FROM shops s
    JOIN users u ON u.id = s.owner_id
    ORDER BY s.created_at DESC`
  );

  return shops;
}

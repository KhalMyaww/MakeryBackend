import type { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../config/database.ts";
import type { CreateShopInput, UpdateShopInput } from "../schemas/shop.schema.ts";

export async function createShop(
  ownerId: number,
  data: CreateShopInput
) {
  const [existingShops] = await pool.execute<RowDataPacket[]>(
    "SELECT id FROM shops WHERE owner_id = ?",
    [ownerId]
  );

  if (existingShops.length > 0) {
    throw new Error("OWNER_ALREADY_HAS_SHOP");
  }

  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO shops (
      owner_id,
      shop_name,
      description,
      address,
      city,
      phone,
      verification_status
    ) VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
    [
      ownerId,
      data.shop_name,
      data.description,
      data.address,
      data.city,
      data.phone
    ]
  );

  return {
    id: result.insertId,
    owner_id: ownerId,
    ...data,
    verification_status: "pending"
  };
}


export async function getShopByOwner(ownerId: number) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT *
     FROM shops
     WHERE owner_id = ?`,
    [ownerId]
  );

  return rows[0] ?? null;
}

export async function updateShop(
  ownerId: number,
  data: UpdateShopInput
) {
  const existingShop = await getShopByOwner(ownerId);

  if (!existingShop) {
    return null;
  }

  await pool.execute(
    `UPDATE shops
     SET shop_name = ?,
         description = ?,
         address = ?,
         city = ?,
         phone = ?
     WHERE owner_id = ?`,
    [
      data.shop_name,
      data.description,
      data.address,
      data.city,
      data.phone,
      ownerId
    ]
  );

  return getShopByOwner(ownerId);
}


export async function getApprovedShops() {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT
      id,
      shop_name,
      description,
      address,
      city,
      phone,
      shop_image,
      verification_status,
      created_at
     FROM shops
     WHERE verification_status = 'approved'
     ORDER BY created_at DESC`
  );

  return rows;
}

export async function getApprovedShopById(shopId: number) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT
      id,
      shop_name,
      description,
      address,
      city,
      phone,
      shop_image,
      verification_status,
      created_at
     FROM shops
     WHERE id = ?
       AND verification_status = 'approved'`,
    [shopId]
  );

  return rows[0] ?? null;
}

export async function getPendingShops() {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT id, owner_id, shop_name, description, address, city,
    phone, shop_image, verification_status, created_at
    FROM shops
    WHERE verification_status = 'pending'
    ORDER BY created_at ASC`
  );

  return rows;
}

export async function verifyShop(
  shopId: number,
  status: "approved" | "rejected"
) {
  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE shops
    SET verification_status = ?
    WHERE id = ? AND verification_status = 'pending'`,
    [status, shopId]
  );

  return result.affectedRows > 0;
}
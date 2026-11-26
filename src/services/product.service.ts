import pool from "../config/database.ts";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

import type {
  CreateProductInput,
  UpdateProductInput
} from "../schemas/product.schema.ts";

export async function getAllProducts() {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT
      p.id,
      p.shop_id,
      p.category_id,
      p.name,
      p.description,
      p.price,
      p.material,
      p.size,
      p.color,
      p.stock,
      p.image_url,
      p.is_available,
      p.created_at,
      c.name AS category_name,
      s.shop_name
    FROM products p
    JOIN categories c ON p.category_id = c.id
    JOIN shops s ON p.shop_id = s.id
    WHERE
      s.verification_status = 'approved'
      AND p.is_available = TRUE
      AND p.stock > 0
    ORDER BY p.created_at DESC`
  );

  return rows;
}

export async function getProductById(id: number) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT
      p.id,
      p.shop_id,
      p.category_id,
      p.name,
      p.description,
      p.price,
      p.material,
      p.size,
      p.color,
      p.stock,
      p.image_url,
      p.is_available,
      p.created_at,
      c.name AS category_name,
      s.shop_name
    FROM products p
    JOIN categories c ON p.category_id = c.id
    JOIN shops s ON p.shop_id = s.id
    WHERE
      p.id = ?
      AND s.verification_status = 'approved'`,
    [id]
  );

  return rows[0] ?? null;
}

export async function getProductsByShop(ownerId: number) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT
      p.*,
      c.name AS category_name
    FROM products p
    JOIN shops s ON p.shop_id = s.id
    JOIN categories c ON p.category_id = c.id
    WHERE s.owner_id = ?
    ORDER BY p.created_at DESC`,
    [ownerId]
  );

  return rows;
}

export async function createProduct(
  ownerId: number,
  data: CreateProductInput
) {
  const [shops] = await pool.execute<RowDataPacket[]>(
    `SELECT id, verification_status
    FROM shops
    WHERE owner_id = ?`,
    [ownerId]
  );

  const shop = shops[0];

  if (!shop) {
    throw new Error("SHOP_NOT_FOUND");
  }

  if (shop.verification_status !== "approved") {
    throw new Error("SHOP_NOT_APPROVED");
  }

  const [categories] = await pool.execute<RowDataPacket[]>(
    "SELECT id FROM categories WHERE id = ?",
    [data.category_id]
  );

  if (categories.length === 0) {
    throw new Error("CATEGORY_NOT_FOUND");
  }

  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO products (
      shop_id,
      category_id,
      name,
      description,
      price,
      material,
      size,
      color,
      stock,
      image_url,
      is_available
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      shop.id,
      data.category_id,
      data.name,
      data.description,
      data.price,
      data.material,
      data.size,
      data.color,
      data.stock,
      data.image_url ?? null,
      data.stock > 0
    ]
  );

  return getProductById(result.insertId);
}

export async function updateProduct(
  ownerId: number,
  productId: number,
  data: UpdateProductInput
) {
  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE products p
    JOIN shops s ON p.shop_id = s.id
    SET
      p.category_id = ?,
      p.name = ?,
      p.description = ?,
      p.price = ?,
      p.material = ?,
      p.size = ?,
      p.color = ?,
      p.stock = ?,
      p.image_url = ?,
      p.is_available = ?
    WHERE p.id = ? AND s.owner_id = ?`,
    [
      data.category_id,
      data.name,
      data.description,
      data.price,
      data.material,
      data.size,
      data.color,
      data.stock,
      data.image_url ?? null,
      data.stock > 0,
      productId,
      ownerId
    ]
  );

  if (result.affectedRows === 0) {
    const [existing] = await pool.execute<RowDataPacket[]>(
      `SELECT p.id
      FROM products p
      JOIN shops s ON p.shop_id = s.id
      WHERE p.id = ? AND s.owner_id = ?`,
      [productId, ownerId]
    );

    if (existing.length === 0) {
      return null;
    }
  }

  return getProductByOwnerAndId(ownerId, productId);
}

async function getProductByOwnerAndId(
  ownerId: number,
  productId: number
) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT p.*
    FROM products p
    JOIN shops s ON p.shop_id = s.id
    WHERE p.id = ? AND s.owner_id = ?`,
    [productId, ownerId]
  );

  return rows[0] ?? null;
}

export async function deleteProduct(ownerId: number, productId: number) {
  const [result] = await pool.execute<ResultSetHeader>(
    `DELETE p FROM products p
    JOIN shops s ON p.shop_id = s.id
    WHERE p.id = ? AND s.owner_id = ?`,
    [productId, ownerId]
  );

  return result.affectedRows > 0;
}
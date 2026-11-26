import pool from "../config/database.ts";
import type {
  RowDataPacket,
  ResultSetHeader
} from "mysql2";

export async function getCustomerComparisons(customerId: number) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT
      pc.id AS comparison_id,
      pc.created_at AS added_at,
      p.id AS product_id,
      p.name AS product_name,
      p.description,
      p.price,
      p.material,
      p.size,
      p.color,
      p.stock,
      p.image_url,
      c.name AS category_name,
      s.id AS shop_id,
      s.shop_name
    FROM product_comparisons pc
    JOIN products p ON pc.product_id = p.id
    JOIN categories c ON p.category_id = c.id
    JOIN shops s ON p.shop_id = s.id
    WHERE
      pc.customer_id = ?
      AND s.verification_status = 'approved'
    ORDER BY pc.created_at DESC`,
    [customerId]
  );

  return rows;
}

export async function addProductComparison(
  customerId: number,
  productId: number
) {
  const [products] = await pool.execute<RowDataPacket[]>(
    `SELECT p.id
    FROM products p
    JOIN shops s ON p.shop_id = s.id
    WHERE
      p.id = ?
      AND s.verification_status = 'approved'
      AND p.is_available = TRUE
      AND p.stock > 0`,
    [productId]
  );

  if (products.length === 0) {
    throw new Error("PRODUCT_NOT_AVAILABLE");
  }

  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO product_comparisons (customer_id, product_id)
    VALUES (?, ?)`,
    [customerId, productId]
  );

  return result.insertId;
}

export async function removeProductComparison(
  customerId: number,
  productId: number
) {
  const [result] = await pool.execute<ResultSetHeader>(
    `DELETE FROM product_comparisons
    WHERE customer_id = ? AND product_id = ?`,
    [customerId, productId]
  );

  return result.affectedRows > 0;
}
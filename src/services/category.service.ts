import pool from "../config/database.ts";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

import type {
  CreateCategoryInput,
  UpdateCategoryInput
} from "../schemas/category.schema.ts";

export async function getAllCategories() {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT id, name, description, created_at
    FROM categories
    ORDER BY name ASC`
  );

  return rows;
}

export async function getCategoryById(id: number) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT id, name, description, created_at
    FROM categories
    WHERE id = ?`,
    [id]
  );

  return rows[0] ?? null;
}

export async function createCategory(data: CreateCategoryInput) {
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO categories (name, description)
    VALUES (?, ?)`,
    [data.name, data.description ?? null]
  );

  return getCategoryById(result.insertId);
}

export async function updateCategory(
  id: number,
  data: UpdateCategoryInput
) {
  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE categories
    SET name = ?, description = ?
    WHERE id = ?`,
    [data.name, data.description ?? null, id]
  );

  if (result.affectedRows === 0) {
    return null;
  }

  return getCategoryById(id);
}

export async function deleteCategory(id: number) {
  const [result] = await pool.execute<ResultSetHeader>(
    `DELETE FROM categories WHERE id = ?`,
    [id]
  );

  return result.affectedRows > 0;
}
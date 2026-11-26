import "dotenv/config";
import mysql from "mysql2/promise";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const useSSL = process.env.DB_SSL === "true";
const caPath = process.env.DB_CA;

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  ssl: useSSL
    ? {
        ca: readFileSync(resolve(process.cwd(), caPath!)),
        rejectUnauthorized: true
      }
    : undefined
});

export async function testDatabase() {
  const connection = await pool.getConnection();

  try {
    const [rows] = await connection.query(
      "SELECT DATABASE() AS database_name"
    );

    return rows;
  } finally {
    connection.release();
  }
}

export default pool;

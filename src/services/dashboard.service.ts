
import pool from "../config/database.ts";
import type { RowDataPacket } from "mysql2/promise";

export async function getCustomerDashboard(customerId: number) {
  const [stats] = await pool.execute<RowDataPacket[]>(
    `SELECT
      COUNT(*) AS total_orders,
      SUM(status = 'pending') AS pending_orders,
      SUM(status IN ('confirmed', 'processing', 'ready', 'delivering')) AS in_progress_orders,
      SUM(status = 'completed') AS completed_orders
    FROM orders
    WHERE customer_id = ?`,
    [customerId]
  );

  const [recentOrders] = await pool.execute<RowDataPacket[]>(
    `SELECT
      id,
      order_code,
      total_price,
      delivery_type,
      status,
      created_at
    FROM orders
    WHERE customer_id = ?
    ORDER BY created_at DESC
    LIMIT 5`,
    [customerId]
  );

  return {
    stats: stats[0],
    recent_orders: recentOrders
  };
}

export async function getOwnerDashboard(ownerId: number) {
  const [shopRows] = await pool.execute<RowDataPacket[]>(
    `SELECT id
    FROM shops
    WHERE owner_id = ?`,
    [ownerId]
  );

  if (shopRows.length === 0) {
    throw new Error("SHOP_NOT_FOUND");
  }

  const shopId = shopRows[0].id;

  const [productStats] = await pool.execute<RowDataPacket[]>(
    `SELECT
      COUNT(*) AS total_products,
      SUM(is_available = TRUE AND stock > 0) AS available_products,
      SUM(stock = 0) AS out_of_stock_products
    FROM products
    WHERE shop_id = ?`,
    [shopId]
  );

  const [orderStats] = await pool.execute<RowDataPacket[]>(
    `SELECT
      COUNT(*) AS total_orders,
      SUM(status = 'pending') AS pending_orders,
      SUM(status = 'completed') AS completed_orders
    FROM orders
    WHERE shop_id = ?`,
    [shopId]
  );

  const [bestSellingProducts] = await pool.execute<RowDataPacket[]>(
    `SELECT
      p.id,
      p.name,
      p.image_url,
      SUM(oi.quantity) AS total_sold
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    JOIN products p ON p.id = oi.product_id
    WHERE o.shop_id = ?
      AND o.status != 'cancelled'
    GROUP BY p.id, p.name, p.image_url
    ORDER BY total_sold DESC
    LIMIT 5`,
    [shopId]
  );

  const [recentOrders] = await pool.execute<RowDataPacket[]>(
    `SELECT
      o.id,
      o.order_code,
      o.total_price,
      o.status,
      o.delivery_type,
      o.created_at,
      u.name AS customer_name
    FROM orders o
    JOIN users u ON u.id = o.customer_id
    WHERE o.shop_id = ?
    ORDER BY o.created_at DESC
    LIMIT 5`,
    [shopId]
  );

  return {
    product_stats: productStats[0],
    order_stats: orderStats[0],
    best_selling_products: bestSellingProducts,
    recent_orders: recentOrders
  };
}

export async function getAdminDashboard() {
  const [userStats] = await pool.execute<RowDataPacket[]>(
    `SELECT
      COUNT(*) AS total_users,
      SUM(role = 'customer') AS total_customers,
      SUM(role = 'owner') AS total_owners
    FROM users`
  );

  const [shopStats] = await pool.execute<RowDataPacket[]>(
    `SELECT
      COUNT(*) AS total_shops,
      SUM(verification_status = 'pending') AS pending_shops,
      SUM(verification_status = 'approved') AS approved_shops,
      SUM(verification_status = 'rejected') AS rejected_shops
    FROM shops`
  );

  const [productStats] = await pool.execute<RowDataPacket[]>(
    `SELECT COUNT(*) AS total_products
    FROM products`
  );

  const [orderStats] = await pool.execute<RowDataPacket[]>(
    `SELECT
      COUNT(*) AS total_orders,
      SUM(status = 'pending') AS pending_orders,
      SUM(status = 'completed') AS completed_orders,
      SUM(status = 'cancelled') AS cancelled_orders
    FROM orders`
  );

  const [recentOrders] = await pool.execute<RowDataPacket[]>(
    `SELECT
      o.id,
      o.order_code,
      o.total_price,
      o.status,
      o.created_at,
      u.name AS customer_name,
      s.shop_name
    FROM orders o
    JOIN users u ON u.id = o.customer_id
    JOIN shops s ON s.id = o.shop_id
    ORDER BY o.created_at DESC
    LIMIT 5`
  );

  return {
    user_stats: userStats[0],
    shop_stats: shopStats[0],
    product_stats: productStats[0],
    order_stats: orderStats[0],
    recent_orders: recentOrders
  };
}

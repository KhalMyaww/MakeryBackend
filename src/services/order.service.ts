import pool from "../config/database.ts";
import type {
  RowDataPacket,
  ResultSetHeader
} from "mysql2";
import { randomBytes } from "node:crypto";
import type { CreateOrderInput } from "../schemas/order.schema.ts";

function generateOrderCode() {
  return `MKY-${Date.now()}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

export async function createOrder(
  customerId: number,
  data: CreateOrderInput
) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [shops] = await connection.execute<RowDataPacket[]>(
      `SELECT id
      FROM shops
      WHERE id = ? AND verification_status = 'approved'
      FOR UPDATE`,
      [data.shop_id]
    );

    if (shops.length === 0) {
      throw new Error("SHOP_NOT_AVAILABLE");
    }

    let totalPrice = 0;

    const orderItems: {
      product_id: number;
      product_name: string;
      quantity: number;
      unit_price: number;
      subtotal: number;
    }[] = [];

    for (const item of data.items) {
      const [products] = await connection.execute<RowDataPacket[]>(
        `SELECT id, name, price, stock, is_available, shop_id
        FROM products
        WHERE id = ? AND shop_id = ?
        FOR UPDATE`,
        [item.product_id, data.shop_id]
      );

      const product = products[0];

      if (!product) {
        throw new Error("PRODUCT_NOT_FOUND");
      }

      if (!product.is_available || Number(product.stock) < item.quantity) {
        throw new Error("INSUFFICIENT_STOCK");
      }

        const unitPrice = Number(product.price);
        const subtotal = Math.round(unitPrice * 100) * item.quantity / 100;

        totalPrice += subtotal;

      orderItems.push({
        product_id: product.id,
        product_name: product.name,
        quantity: item.quantity,
        unit_price: unitPrice,
        subtotal
      });
    }

    const orderCode = generateOrderCode();

    const [orderResult] = await connection.execute<ResultSetHeader>(
      `INSERT INTO orders (
        customer_id,
        shop_id,
        order_code,
        recipient_name,
        recipient_phone,
        delivery_type,
        delivery_address,
        notes,
        total_price,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        customerId,
        data.shop_id,
        orderCode,
        data.recipient_name,
        data.recipient_phone,
        data.delivery_type,
        data.delivery_type === "delivery"
        ? data.delivery_address ?? null
        : null,
        data.notes ?? null,
        totalPrice
      ]
    );

    for (const item of orderItems) {
      await connection.execute(
        `INSERT INTO order_items (
          order_id,
          product_id,
          product_name,
          quantity,
          unit_price,
          subtotal
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          orderResult.insertId,
          item.product_id,
          item.product_name,
          item.quantity,
          item.unit_price,
          item.subtotal
        ]
      );

      await connection.execute(
        `UPDATE products
        SET stock = stock - ?,
            is_available = CASE
                WHEN stock <= 0 THEN FALSE
                ELSE TRUE
            END
        WHERE id = ? AND shop_id = ?`,
        [
          item.quantity,
          item.quantity,
          item.product_id,
          data.shop_id
        ]
      );
    }

    await connection.commit();

    return {
      id: orderResult.insertId,
      order_code: orderCode,
      total_price: totalPrice,
      status: "pending",
      items: orderItems
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function getCustomerOrders(customerId: number) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT
      o.*,
      s.shop_name
    FROM orders o
    JOIN shops s ON o.shop_id = s.id
    WHERE o.customer_id = ?
    ORDER BY o.created_at DESC`,
    [customerId]
  );

  return rows;
}

export async function getOwnerOrders(ownerId: number) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT
      o.*,
      s.shop_name
    FROM orders o
    JOIN shops s ON o.shop_id = s.id
    WHERE s.owner_id = ?
    ORDER BY o.created_at DESC`,
    [ownerId]
  );

  return rows;
}

export async function getOrderDetail(
  orderId: number,
  userId: number,
  role: "customer" | "owner"
) {
  const ownershipCondition = role === "customer"
    ? "o.customer_id = ?"
    : "s.owner_id = ?";

  const [orders] = await pool.execute<RowDataPacket[]>(
    `SELECT o.*, s.shop_name
    FROM orders o
    JOIN shops s ON o.shop_id = s.id
    WHERE o.id = ? AND ${ownershipCondition}`,
    [orderId, userId]
  );

  if (orders.length === 0) {
    return null;
  }

  const [items] = await pool.execute<RowDataPacket[]>(
    `SELECT id, product_id, product_name, quantity, unit_price, subtotal
    FROM order_items
    WHERE order_id = ?`,
    [orderId]
  );

  return {
    ...orders[0],
    items
  };
}

export async function updateOrderStatus(
  ownerId: number,
  orderId: number,
  newStatus:
    | "confirmed"
    | "processing"
    | "ready"
    | "delivering"
    | "completed"
    | "cancelled"
) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Cari pesanan milik toko owner
    const [orders] = await connection.execute<RowDataPacket[]>(
      `SELECT o.id, o.status, o.delivery_type
      FROM orders o
      JOIN shops s ON o.shop_id = s.id
      WHERE o.id = ? AND s.owner_id = ?
      FOR UPDATE`,
      [orderId, ownerId]
    );

    const order = orders[0];

    if (!order) {
      throw new Error("ORDER_NOT_FOUND");
    }

    // Aturan perubahan status
    const allowedTransitions: Record<string, string[]> = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["processing", "cancelled"],
      processing: ["ready", "cancelled"],
      ready: order.delivery_type === "pickup"
        ? ["completed"]
        : ["delivering"],
      delivering: ["completed"],
      completed: [],
      cancelled: []
    };

    if (!allowedTransitions[order.status]?.includes(newStatus)) {
      throw new Error("INVALID_STATUS_TRANSITION");
    }

    // Kembalikan stok jika pesanan dibatalkan
    if (newStatus === "cancelled") {
      const [items] = await connection.execute<RowDataPacket[]>(
        `SELECT product_id, quantity
        FROM order_items
        WHERE order_id = ?`,
        [orderId]
      );

      for (const item of items) {
        if (item.product_id === null) {
          continue;
        }

        await connection.execute(
          `UPDATE products
          SET stock = stock + ?,
              is_available = TRUE
          WHERE id = ?`,
          [item.quantity, item.product_id]
        );
      }
    }

    // Simpan status baru
    await connection.execute(
      `UPDATE orders
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [newStatus, orderId]
    );

    await connection.commit();

    return {
      id: orderId,
      status: newStatus
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
import { Router } from "express";
import {
  createOrderController,
  getMyOrders,
  getIncomingOrders,
  getOrderDetailController,
  updateOrderStatusController
} from "../controllers/order.controller.ts";
import { authenticate } from "../middlewares/auth.middleware.ts";
import { authorize } from "../middlewares/role.middleware.ts";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Orders
 *     description: Pengelolaan pesanan
 */

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Membuat pesanan baru
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shop_id
 *               - recipient_name
 *               - recipient_phone
 *               - delivery_type
 *               - items
 *             properties:
 *               shop_id:
 *                 type: integer
 *               recipient_name:
 *                 type: string
 *               recipient_phone:
 *                 type: string
 *               delivery_type:
 *                 type: string
 *                 enum: [delivery, pickup]
 *               delivery_address:
 *                 type: string
 *                 nullable: true
 *               notes:
 *                 type: string
 *                 nullable: true
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [product_id, quantity]
 *                   properties:
 *                     product_id:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *     responses:
 *       201:
 *         description: Pesanan berhasil dibuat
 *       400:
 *         description: Data tidak valid atau stok tidak mencukupi
 */
router.post("/", authenticate, authorize("customer"), createOrderController);

/**
 * @swagger
 * /orders/my-orders:
 *   get:
 *     summary: Melihat riwayat pesanan customer
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mengambil riwayat pesanan
 */
router.get("/my-orders", authenticate, authorize("customer"), getMyOrders);

/**
 * @swagger
 * /orders/incoming:
 *   get:
 *     summary: Melihat pesanan masuk untuk owner
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mengambil pesanan masuk
 */
router.get("/incoming", authenticate, authorize("owner"), getIncomingOrders);

/**
 * @swagger
 * /orders/{id}/status:
 *   patch:
 *     summary: Mengubah status pesanan
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [confirmed, processing, ready, delivering, completed, cancelled]
 *     responses:
 *       200:
 *         description: Status pesanan berhasil diperbarui
 *       400:
 *         description: Transisi status tidak valid
 *       404:
 *         description: Pesanan tidak ditemukan
 */
router.patch(
  "/:id/status",
  authenticate,
  authorize("owner"),
  updateOrderStatusController
);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Melihat detail pesanan
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Berhasil mengambil detail pesanan
 *       404:
 *         description: Pesanan tidak ditemukan
 */
router.get(
  "/:id",
  authenticate,
  authorize("customer", "owner"),
  getOrderDetailController
);

export default router;
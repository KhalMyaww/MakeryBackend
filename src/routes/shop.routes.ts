import { Router } from "express";
import {
  createShopController,
  getMyShop,
  updateMyShop,
  getPublicShops,
  getPublicShopDetail,
  getPendingShopsController,
  verifyShopController
} from "../controllers/shop.controller.ts";
import { authenticate } from "../middlewares/auth.middleware.ts";
import { authorize } from "../middlewares/role.middleware.ts";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Shops
 *     description: Pengelolaan toko
 */

/**
 * @swagger
 * /shops/my-shop:
 *   get:
 *     summary: Melihat toko milik sendiri
 *     tags: [Shops]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mengambil toko
 *       404:
 *         description: Toko belum tersedia
 */
router.get("/my-shop", authenticate, authorize("owner"), getMyShop);

/**
 * @swagger
 * /shops/my-shop:
 *   put:
 *     summary: Memperbarui toko milik sendiri
 *     tags: [Shops]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               shop_name:
 *                 type: string
 *               description:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Toko berhasil diperbarui
 */
router.put("/my-shop", authenticate, authorize("owner"), updateMyShop);

/**
 * @swagger
 * /shops:
 *   post:
 *     summary: Membuat toko baru
 *     tags: [Shops]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [shop_name, description, address, city, phone]
 *             properties:
 *               shop_name:
 *                 type: string
 *               description:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Toko berhasil dibuat
 *       409:
 *         description: Pengguna sudah memiliki toko
 */
router.post("/", authenticate, authorize("owner"), createShopController);

/**
 * @swagger
 * /shops/admin/pending:
 *   get:
 *     summary: Melihat toko yang menunggu verifikasi
 *     tags: [Shops]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mengambil toko pending
 */
router.get(
  "/admin/pending",
  authenticate,
  authorize("admin"),
  getPendingShopsController
);

/**
 * @swagger
 * /shops/{id}/verification:
 *   patch:
 *     summary: Memverifikasi toko
 *     tags: [Shops]
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
 *             required: [verification_status]
 *             properties:
 *               verification_status:
 *                 type: string
 *                 enum: [approved, rejected]
 *     responses:
 *       200:
 *         description: Status toko berhasil diperbarui
 *       404:
 *         description: Toko tidak ditemukan
 */
router.patch(
  "/:id/verification",
  authenticate,
  authorize("admin"),
  verifyShopController
);

/**
 * @swagger
 * /shops:
 *   get:
 *     summary: Melihat daftar toko yang disetujui
 *     tags: [Shops]
 *     responses:
 *       200:
 *         description: Berhasil mengambil daftar toko
 */
router.get("/", getPublicShops);

/**
 * @swagger
 * /shops/{id}:
 *   get:
 *     summary: Melihat detail toko
 *     tags: [Shops]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Berhasil mengambil detail toko
 *       404:
 *         description: Toko tidak ditemukan
 */
router.get("/:id", getPublicShopDetail);

export default router;
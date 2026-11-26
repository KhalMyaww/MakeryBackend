import { Router } from "express";
import {
  getProducts,
  getProductDetail,
  getMyProducts,
  createProductController,
  updateProductController,
  deleteProductController
} from "../controllers/product.controller.ts";
import { authenticate } from "../middlewares/auth.middleware.ts";
import { authorize } from "../middlewares/role.middleware.ts";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Products
 *     description: Pengelolaan produk handmade
 */

/**
 * @swagger
 * /products/my-products:
 *   get:
 *     summary: Melihat produk milik toko sendiri
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mengambil produk
 */
router.get("/my-products", authenticate, authorize("owner"), getMyProducts);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Menambahkan produk
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category_id
 *               - name
 *               - description
 *               - price
 *               - material
 *               - size
 *               - color
 *               - stock
 *             properties:
 *               category_id:
 *                 type: integer
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               material:
 *                 type: string
 *               size:
 *                 type: string
 *               color:
 *                 type: string
 *               stock:
 *                 type: integer
 *               image_url:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Produk berhasil ditambahkan
 *       400:
 *         description: Data tidak valid
 *       403:
 *         description: Toko belum disetujui
 */
router.post("/", authenticate, authorize("owner"), createProductController);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Memperbarui produk
 *     tags: [Products]
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
 *             properties:
 *               category_id:
 *                 type: integer
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               material:
 *                 type: string
 *               size:
 *                 type: string
 *               color:
 *                 type: string
 *               stock:
 *                 type: integer
 *               image_url:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Produk berhasil diperbarui
 *       404:
 *         description: Produk tidak ditemukan
 *
 *   delete:
 *     summary: Menghapus produk
 *     tags: [Products]
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
 *         description: Produk berhasil dihapus
 *       404:
 *         description: Produk tidak ditemukan
 */
router.put("/:id", authenticate, authorize("owner"), updateProductController);
router.delete("/:id", authenticate, authorize("owner"), deleteProductController);

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Melihat daftar produk tersedia
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Berhasil mengambil daftar produk
 */
router.get("/", getProducts);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Melihat detail produk
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Berhasil mengambil detail produk
 *       404:
 *         description: Produk tidak ditemukan
 */
router.get("/:id", getProductDetail);

export default router;
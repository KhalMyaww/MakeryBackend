import { Router } from "express";
import {
  getMyComparisons,
  addComparisonController,
  removeComparisonController
} from "../controllers/comparison.controller.ts";
import { authenticate } from "../middlewares/auth.middleware.ts";
import { authorize } from "../middlewares/role.middleware.ts";

const router = Router();

router.use(authenticate, authorize("customer"));

/**
 * @swagger
 * tags:
 *   - name: Comparisons
 *     description: Perbandingan produk
 */

/**
 * @swagger
 * /comparisons:
 *   get:
 *     summary: Melihat daftar produk perbandingan
 *     tags: [Comparisons]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mengambil daftar perbandingan
 */
router.get("/", getMyComparisons);

/**
 * @swagger
 * /comparisons:
 *   post:
 *     summary: Menambahkan produk ke perbandingan
 *     tags: [Comparisons]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [product_id]
 *             properties:
 *               product_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Produk berhasil ditambahkan
 *       409:
 *         description: Produk sudah ada dalam perbandingan
 */
router.post("/", addComparisonController);

/**
 * @swagger
 * /comparisons/{productId}:
 *   delete:
 *     summary: Menghapus produk dari perbandingan
 *     tags: [Comparisons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Produk berhasil dihapus
 */
router.delete("/:productId", removeComparisonController);

export default router;
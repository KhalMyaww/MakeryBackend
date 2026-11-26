import { Router } from "express";
import {
  getCategories,
  getCategoryDetail,
  createCategoryController,
  updateCategoryController,
  deleteCategoryController
} from "../controllers/category.controller.ts";
import { authenticate } from "../middlewares/auth.middleware.ts";
import { authorize } from "../middlewares/role.middleware.ts";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Categories
 *     description: Pengelolaan kategori produk
 */

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Melihat semua kategori
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Berhasil mengambil kategori
 */
router.get("/", getCategories);

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Melihat detail kategori
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Berhasil mengambil detail kategori
 *       404:
 *         description: Kategori tidak ditemukan
 */
router.get("/:id", getCategoryDetail);

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Membuat kategori
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Kategori berhasil dibuat
 *       409:
 *         description: Kategori sudah tersedia
 */
router.post(
  "/",
  authenticate,
  authorize("admin"),
  createCategoryController
);

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Memperbarui kategori
 *     tags: [Categories]
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Kategori berhasil diperbarui
 */
router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  updateCategoryController
);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Menghapus kategori
 *     tags: [Categories]
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
 *         description: Kategori berhasil dihapus
 *       409:
 *         description: Kategori masih digunakan produk
 */
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  deleteCategoryController
);

export default router;
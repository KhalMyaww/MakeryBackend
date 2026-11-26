import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.ts";
import { authorize } from "../middlewares/role.middleware.ts";
import {
  getUsers,
  getUserDetailController,
  deleteUserController,
  getAdminShops
} from "../controllers/admin.controller.ts";

const router = Router();

router.use(authenticate, authorize("admin"));

/**
 * @swagger
 * tags:
 *   - name: Admin
 *     description: Pengelolaan pengguna dan toko oleh admin
 */

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Melihat seluruh pengguna
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mengambil daftar pengguna
 *       403:
 *         description: Hanya admin yang dapat mengakses
 */
router.get("/users", getUsers);

/**
 * @swagger
 * /admin/users/{id}:
 *   get:
 *     summary: Melihat detail pengguna
 *     tags: [Admin]
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
 *         description: Berhasil mengambil detail pengguna
 *       404:
 *         description: Pengguna tidak ditemukan
 */
router.get("/users/:id", getUserDetailController);

/**
 * @swagger
 * /admin/users/{id}:
 *   delete:
 *     summary: Menghapus pengguna
 *     tags: [Admin]
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
 *         description: Pengguna berhasil dihapus
 *       400:
 *         description: Tidak dapat menghapus akun sendiri
 *       403:
 *         description: Tidak dapat menghapus akun admin
 *       404:
 *         description: Pengguna tidak ditemukan
 */
router.delete("/users/:id", deleteUserController);

/**
 * @swagger
 * /admin/shops:
 *   get:
 *     summary: Melihat seluruh toko
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mengambil daftar toko
 */
router.get("/shops", getAdminShops);

export default router;
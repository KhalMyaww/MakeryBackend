import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.ts";
import { getDashboard } from "../controllers/dashboard.controller.ts";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Dashboard
 *     description: Dashboard berdasarkan role pengguna
 */

/**
 * @swagger
 * /dashboard:
 *   get:
 *     summary: Mengambil data dashboard
 *     description: Data dashboard menyesuaikan role customer, owner, atau admin.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mengambil data dashboard
 *       401:
 *         description: Belum login
 *       403:
 *         description: Role tidak memiliki akses
 */
router.get("/", authenticate, getDashboard);

export default router;
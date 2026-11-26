import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.ts";
import { authorize } from "../middlewares/role.middleware.ts";
import { uploadImage } from "../middlewares/upload.middleware.ts";
import {
  uploadProductImageController,
  uploadProfileImageController
} from "../controllers/upload.controller.ts";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Uploads
 *     description: Upload gambar menggunakan Cloudinary
 */

/**
 * @swagger
 * /uploads/product-image:
 *   post:
 *     summary: Upload gambar produk
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [image]
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Gambar berhasil diupload
 *       400:
 *         description: File tidak valid
 */
router.post(
  "/product-image",
  authenticate,
  authorize("owner"),
  uploadImage.single("image"),
  uploadProductImageController
);

/**
 * @swagger
 * /uploads/profile-image:
 *   post:
 *     summary: Upload foto profil
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [image]
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Foto profil berhasil diupload
 *       400:
 *         description: File tidak valid
 */
router.post(
  "/profile-image",
  authenticate,
  uploadImage.single("image"),
  uploadProfileImageController
);

export default router;
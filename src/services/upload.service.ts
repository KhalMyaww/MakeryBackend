import cloudinary from "../config/cloudinary.ts";
import { Readable } from "node:stream";

export function uploadProductImage(file: Express.Multer.File) {
  return new Promise<{ url: string; public_id: string }>(
    (resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "makery/products",
          resource_type: "image"
        },
        (error, result) => {
          if (error || !result) {
            return reject(error ?? new Error("Upload gagal"));
          }

          resolve({
            url: result.secure_url,
            public_id: result.public_id
          });
        }
      );

      Readable.from(file.buffer).pipe(uploadStream);
    }
  );
}

export function uploadProfileImage(file: Express.Multer.File) {
  return new Promise<{ url: string; public_id: string }>(
    (resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "makery/profiles",
          resource_type: "image"
        },
        (error, result) => {
          if (error || !result) {
            return reject(error ?? new Error("Upload gagal"));
          }

          resolve({
            url: result.secure_url,
            public_id: result.public_id
          });
        }
      );

      Readable.from(file.buffer).pipe(uploadStream);
    }
  );
}
import { randomUUID } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import multer from "multer";
import type { Request, Response } from "express";
import { OrderError } from "../services/orderService.js";

export const uploadsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "uploads");

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);
const MAX_BYTES = 2 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().replace(/[^a-z0-9.]/g, "") || ".png";
    cb(null, `${Date.now()}-${randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_TYPES.has(file.mimetype)) {
      cb(new OrderError("Only JPEG, PNG, WebP, GIF or AVIF images are allowed", 422));
      return;
    }
    cb(null, true);
  },
});

export function uploadImage(req: Request, res: Response) {
  if (!req.file) {
    res.status(422).json({ error: { code: "BAD_REQUEST", message: "No file received (field must be named \"image\")" } });
    return;
  }
  res.status(201).json({ data: { url: `/uploads/${req.file.filename}` } });
}

export const uploadMiddleware = upload.single("image");

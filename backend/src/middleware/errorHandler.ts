import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import multer from "multer";
import { OrderError } from "../services/orderService.js";

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ error: { code: "NOT_FOUND", message: "Resource not found" } });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(422).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid input",
        fields: err.flatten(),
      },
    });
  }

  if (err instanceof multer.MulterError) {
    const message = err.code === "LIMIT_FILE_SIZE" ? "Image is too large (max 2 MB)" : `Upload failed: ${err.code}`;
    return res.status(422).json({ error: { code: "UPLOAD_ERROR", message } });
  }

  if (err instanceof OrderError) {
    return res.status(err.status).json({
      error: { code: "ORDER_ERROR", message: err.message, ...(err.detail ? { detail: err.detail } : {}) },
    });
  }

  const status = err instanceof SyntaxError ? 400 : 500;
  if (status === 500) console.error("[error]", err);

  return res.status(status).json({
    error: {
      code: status === 500 ? "INTERNAL_ERROR" : "BAD_REQUEST",
      message: status === 500 ? "Something went wrong" : "Malformed request",
    },
  });
}

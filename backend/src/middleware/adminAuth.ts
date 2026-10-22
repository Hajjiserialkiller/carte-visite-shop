import type { NextFunction, Request, Response } from "express";
import { config } from "../config.js";

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization ?? "";
  const [scheme, token] = header.split(" ");

  const provided = scheme === "Bearer" ? token ?? "" : "";
  const expected = config.ADMIN_TOKEN;

  if (!expected || provided.length === 0 || !timingSafeEqual(provided, expected)) {
    return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Invalid admin token" } });
  }

  next();
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

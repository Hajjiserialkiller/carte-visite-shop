import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  CORS_ORIGINS: z.string().default("http://localhost:5173"),
  DATABASE_URL: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().optional().default(""),
  STRIPE_PRICE_CURRENCY: z.string().default("EUR"),
  APP_URL: z.string().default("http://localhost:4000"),
  ADMIN_TOKEN: z.string().optional().default(""),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment configuration:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const config = parsed.data;

export const corsOrigins = config.CORS_ORIGINS.split(",")
  .map((o) => o.trim())
  .filter(Boolean);

export const isStripeConfigured = Boolean(config.STRIPE_SECRET_KEY);

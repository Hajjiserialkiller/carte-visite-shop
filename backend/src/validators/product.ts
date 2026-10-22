import { z } from "zod";

export const priceTierSchema = z.object({
  quantity: z.number().int().min(10).max(100000),
  pricePer100: z.number().int().min(100).max(100000000),
});

export const productSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(80),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers and dashes"),
  description: z.string().trim().min(5).max(500),
  category: z.string().trim().min(2).max(40),
  material: z.string().trim().min(2).max(60),
  finish: z.string().trim().min(2).max(60),
  imageUrl: z.string().trim().min(1).max(300),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
  tiers: z.array(priceTierSchema).min(1, "At least one price tier is required"),
});

export const productUpdateSchema = productSchema.partial().extend({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers and dashes")
    .optional(),
});

export const orderStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED"]),
});

export type ProductPayload = z.infer<typeof productSchema>;

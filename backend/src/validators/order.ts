import { z } from "zod";

const hexColor = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "Invalid hex color");

export const customizationSchema = z.object({
  template: z.enum(["classic", "minimal", "bold", "elegant"]),
  bg: hexColor,
  accent: hexColor,
  font: z.string().max(40).min(1),
  text: z.object({
    name: z.string().trim().max(60),
    title: z.string().trim().max(60).optional().default(""),
    company: z.string().trim().max(60).optional().default(""),
    phone: z.string().trim().max(30).optional().default(""),
    email: z.string().trim().max(80).optional().default(""),
    website: z.string().trim().max(80).optional().default(""),
    address: z.string().trim().max(120).optional().default(""),
  }),
});

export const orderItemSchema = z.object({
  productSlug: z.string().min(1).max(120),
  quantity: z.number().int().min(1).max(10000),
  custom: customizationSchema,
});

export const orderSchema = z.object({
  email: z.string().trim().email("Invalid email").max(120),
  fullName: z.string().trim().min(2, "Full name is required").max(100),
  company: z.string().trim().max(100).optional(),
  addressLine1: z.string().trim().min(3, "Address is required").max(160),
  addressLine2: z.string().trim().max(160).optional(),
  city: z.string().trim().min(2, "City is required").max(80),
  postalCode: z.string().trim().min(2, "Postal code is required").max(20),
  country: z
    .string()
    .trim()
    .length(2, "Use the 2-letter country code")
    .regex(/^[A-Za-z]{2}$/)
    .transform((v) => v.toUpperCase()),
  phone: z.string().trim().min(6, "Phone is required").max(30),
  items: z.array(orderItemSchema).min(1, "Cart is empty").max(50),
});

export type OrderPayload = z.infer<typeof orderSchema>;

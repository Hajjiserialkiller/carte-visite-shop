import type { Product, Category, OrderDetail } from "../types";
import { ApiError } from "./api";

const ADMIN_TOKEN_KEY = "cartelier.adminToken";

export function getAdminToken(): string | null {
  try {
    return sessionStorage.getItem(ADMIN_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAdminToken(token: string): void {
  try {
    sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
  } catch {
    /* storage unavailable */
  }
}

export function clearAdminToken(): void {
  try {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  } catch {
    /* storage unavailable */
  }
}

export type AdminProductInput = {
  name: string;
  slug: string;
  description: string;
  category: string;
  material: string;
  finish: string;
  imageUrl: string;
  featured: boolean;
  active: boolean;
  tiers: { quantity: number; pricePer100: number }[];
};

export type AdminOrder = Omit<OrderDetail, "totals"> & {
  id: string;
  subtotal: number;
  shipping: number;
  total: number;
  items: OrderDetail["items"];
};

async function adminRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAdminToken();
  const res = await fetch(`/api${path}`, {
    method: init?.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...init,
  });

  if (!res.ok) {
    let payload: { error?: { message?: string } } = {};
    try {
      payload = await res.json();
    } catch {
      /* non-JSON body */
    }
    throw new ApiError(res.status, payload.error?.message ?? `Admin request failed (${res.status})`);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export function adminLogin(token: string): Promise<{ ok: boolean }> {
  setAdminToken(token);
  return adminRequest<{ data: unknown }>("/admin/products").then(
    () => ({ ok: true }),
    (err) => {
      clearAdminToken();
      throw err;
    },
  );
}

export function adminListProducts() {
  return adminRequest<{ data: (Product & { category: string })[] }>("/admin/products");
}

export function adminCreateProduct(input: AdminProductInput) {
  return adminRequest<{ data: Product }>("/admin/products", { method: "POST", body: JSON.stringify(input) });
}

export function adminUpdateProduct(id: string, input: Partial<AdminProductInput>) {
  return adminRequest<{ data: Product }>(`/admin/products/${id}`, { method: "PATCH", body: JSON.stringify(input) });
}

export function adminDeleteProduct(id: string) {
  return adminRequest<void>(`/admin/products/${id}`, { method: "DELETE" });
}

export async function adminUploadImage(file: File): Promise<string> {
  const token = getAdminToken();
  const body = new FormData();
  body.append("image", file);
  const res = await fetch("/api/admin/upload", {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body,
  });
  if (!res.ok) {
    let message = `Upload failed (${res.status})`;
    try {
      const payload = (await res.json()) as { error?: { message?: string } };
      message = payload.error?.message ?? message;
    } catch {
      /* non-JSON body */
    }
    throw new ApiError(res.status, message);
  }
  const payload = (await res.json()) as { data: { url: string } };
  return payload.data.url;
}

export function adminListOrders(status = "all") {
  return adminRequest<{ data: AdminOrder[] }>(`/admin/orders?status=${encodeURIComponent(status)}`);
}

export function adminUpdateOrderStatus(id: string, status: "PENDING" | "CONFIRMED" | "CANCELLED") {
  return adminRequest<{ data: AdminOrder }>(`/admin/orders/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
}

export const ADMIN_CATEGORIES: Category[] = [
  { slug: "classic", count: 0 },
  { slug: "premium", count: 0 },
  { slug: "metal", count: 0 },
  { slug: "transparent", count: 0 },
  { slug: "luxury", count: 0 },
  { slug: "kraft", count: 0 },
];

export const ADMIN_IMAGE_PRESETS = [
  "/images/cards/classic-matte.svg",
  "/images/cards/classic-gloss.svg",
  "/images/cards/premium-soft-touch.svg",
  "/images/cards/premium-gold-foil.svg",
  "/images/cards/metal-brushed.svg",
  "/images/cards/transparent-crystal.svg",
  "/images/cards/velvet-deboss.svg",
  "/images/cards/kraft-eco.svg",
];

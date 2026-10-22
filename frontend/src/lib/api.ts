import type { Category, OrderDetail, OrderPayload, OrderResponse, Product } from "../types";

const BASE = "/api";

export class ApiError extends Error {
  status: number;
  fields?: unknown;

  constructor(status: number, message: string, fields?: unknown) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: init?.body ? { "Content-Type": "application/json" } : undefined,
    ...init,
  });

  if (!res.ok) {
    let payload: { error?: { message?: string; fields?: unknown } } = {};
    try {
      payload = await res.json();
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(res.status, payload.error?.message ?? `Request failed (${res.status})`, payload.error?.fields);
  }

  return (await res.json()) as T;
}

export type ApiListResponse<T> = { data: T };

export function getProducts(params: { category?: string; search?: string; featured?: boolean } = {}) {
  const qs = new URLSearchParams();
  if (params.category && params.category !== "all") qs.set("category", params.category);
  if (params.search) qs.set("search", params.search);
  if (params.featured) qs.set("featured", "true");
  return request<ApiListResponse<Product[]>>(`/products?${qs.toString()}`);
}

export function getProduct(slug: string) {
  return request<ApiListResponse<Product>>(`/products/${slug}`);
}

export function getCategories() {
  return request<ApiListResponse<Category[]>>("/products/categories");
}

export function getFeatured() {
  return request<ApiListResponse<Product[]>>("/products?featured=true");
}

export function createOrder(payload: OrderPayload) {
  return request<ApiListResponse<OrderResponse>>("/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getOrder(reference: string) {
  return request<ApiListResponse<OrderDetail>>(`/orders/${reference}`);
}

export function verifyOrder(reference: string) {
  return request<ApiListResponse<OrderDetail>>(`/orders/${reference}/verify`);
}

import type { Request, Response, NextFunction } from "express";
import * as productService from "../services/productService.js";

export async function getProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const { category, search, featured } = req.query;
    const products = await productService.listProducts({
      category: typeof category === "string" ? category : undefined,
      search: typeof search === "string" ? search.trim().slice(0, 100) : undefined,
      featuredOnly: featured === "true",
    });
    res.json({ data: products });
  } catch (err) {
    next(err);
  }
}

export async function getProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const { slug } = req.params;
    if (!slug) {
      return res.status(400).json({ error: { code: "BAD_REQUEST", message: "Missing slug" } });
    }
    const product = await productService.getProductBySlug(slug);
    if (!product) {
      return res.status(404).json({ error: { code: "NOT_FOUND", message: "Product not found" } });
    }
    res.json({ data: product });
  } catch (err) {
    next(err);
  }
}

export async function getCategories(_req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ data: await productService.listCategories() });
  } catch (err) {
    next(err);
  }
}

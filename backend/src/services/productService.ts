import { prisma } from "../lib/prisma.js";

export async function listProducts(opts: { category?: string; search?: string; featuredOnly?: boolean }) {
  const { category, search, featuredOnly } = opts;

  return prisma.product.findMany({
    where: {
      active: true,
      ...(featuredOnly ? { featured: true } : {}),
      ...(category && category !== "all" ? { category } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { description: { contains: search } },
              { material: { contains: search } },
              { finish: { contains: search } },
            ],
          }
        : {}),
    },
    include: { tiers: { orderBy: { quantity: "asc" } } },
    orderBy: { createdAt: "asc" },
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug, active: true },
    include: { tiers: { orderBy: { quantity: "asc" } } },
  });
}

export async function listCategories() {
  const rows = await prisma.product.groupBy({
    by: ["category"],
    where: { active: true },
    _count: { category: true },
  });
  return rows.map((r) => ({ slug: r.category, count: r._count.category }));
}

export async function getFeatured() {
  return prisma.product.findMany({
    where: { active: true, featured: true },
    include: { tiers: { orderBy: { quantity: "asc" } } },
    take: 4,
  });
}

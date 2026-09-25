import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ProductFilters, ProductWithRelations, ProductDetail } from "@/types";

const listInclude = {
  images: { orderBy: { position: "asc" } },
  category: { select: { id: true, name: true, slug: true } },
  brand: { select: { id: true, name: true, slug: true } },
  variants: true,
} satisfies Prisma.ProductInclude;

// Money already stored as Int cents; just normalize variant shape.
function serialize<T extends { price: number; discount: number | null }>(p: T) {
  return { ...p, price: p.price, discount: p.discount ?? null };
}

export async function getProducts(filters: ProductFilters = {}) {
  const {
    q,
    category,
    brand,
    minPrice,
    maxPrice,
    minRating,
    sort = "newest",
    page = 1,
    perPage = 12,
  } = filters;

  const where: Prisma.ProductWhereInput = {
    isActive: true,
    ...(q && { name: { contains: q, mode: "insensitive" } }),
    ...(category && { category: { slug: category } }),
    ...(brand && { brand: { slug: brand } }),
    ...(minRating && { rating: { gte: minRating } }),
    ...((minPrice || maxPrice) && {
      price: {
        ...(minPrice && { gte: minPrice }),
        ...(maxPrice && { lte: maxPrice }),
      },
    }),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "price-asc"
      ? { price: "asc" }
      : sort === "price-desc"
      ? { price: "desc" }
      : sort === "rating"
      ? { rating: "desc" }
      : sort === "featured"
      ? { isFeatured: "desc" }
      : { createdAt: "desc" };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      include: listInclude,
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products: items.map((p) => ({
      ...serialize(p),
      variants: p.variants.map((v) => ({ ...v, price: v.price ?? null })),
    })) as ProductWithRelations[],
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  const p = await prisma.product.findUnique({
    where: { slug },
    include: {
      ...listInclude,
      specs: true,
      reviews: {
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, image: true } } },
      },
    },
  });
  if (!p) return null;
  return {
    ...serialize(p),
    variants: p.variants.map((v) => ({ ...v, price: v.price ?? null })),
  } as ProductDetail;
}

export async function getFeaturedProducts(limit = 8) {
  const items = await prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    orderBy: { createdAt: "desc" },
    include: listInclude,
    take: limit,
  });
  return items.map((p) => ({
    ...serialize(p),
    variants: p.variants.map((v) => ({ ...v, price: v.price ?? null })),
  })) as ProductWithRelations[];
}

export async function getRelatedProducts(categoryId: string, excludeId: string, limit = 4) {
  const items = await prisma.product.findMany({
    where: { isActive: true, categoryId, id: { not: excludeId } },
    include: listInclude,
    take: limit,
  });
  return items.map((p) => ({
    ...serialize(p),
    variants: p.variants.map((v) => ({ ...v, price: v.price ?? null })),
  })) as ProductWithRelations[];
}

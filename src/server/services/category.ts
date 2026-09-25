import { prisma } from "@/lib/prisma";

export async function getCategories() {
  return prisma.category.findMany({
    where: { parentId: null },
    include: { children: true, _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });
}

export async function getBrands() {
  return prisma.brand.findMany({ orderBy: { name: "asc" } });
}

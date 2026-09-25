"use server";

import { revalidatePath } from "next/cache";
import type { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { slugify, toCents } from "@/lib/utils";
import { productSchema } from "@/lib/validations/product";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");
  return session.user;
}

export type AdminResult = { error?: string; success?: boolean; id?: string };

export async function upsertProduct(
  productId: string | null,
  raw: Record<string, unknown>
): Promise<AdminResult> {
  try {
    await requireAdmin();
  } catch {
    return { error: "Unauthorized" };
  }

  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid input" };
  const d = parsed.data;

  const data = {
    name: d.name,
    slug: slugify(d.name),
    description: d.description || null,
    price: toCents(d.price),
    discount: d.discount != null ? toCents(d.discount) : null,
    sku: d.sku,
    stock: d.stock,
    categoryId: d.categoryId,
    brandId: d.brandId || null,
    isActive: d.isActive,
    isFeatured: d.isFeatured,
  };

  try {
    let id = productId ?? undefined;
    if (productId) {
      await prisma.product.update({ where: { id: productId }, data });
      id = productId;
    } else {
      const created = await prisma.product.create({ data });
      id = created.id;
    }

    // Sync images (replace set)
    await prisma.productImage.deleteMany({ where: { productId: id } });
    if (d.images.length > 0) {
      await prisma.productImage.createMany({
        data: d.images.map((url, i) => ({ productId: id!, url, position: i, alt: d.name })),
      });
    }

    // Sync variants (replace set)
    await prisma.productVariant.deleteMany({ where: { productId: id } });
    if (d.variants.length > 0) {
      await prisma.productVariant.createMany({
        data: d.variants.map((v) => ({
          productId: id!,
          name: v.name,
          color: v.color || null,
          size: v.size || null,
          sku: v.sku,
          price: v.price != null ? toCents(v.price) : null,
          stock: v.stock,
        })),
      });
    }

    revalidatePath("/admin/products");
    return { success: true, id };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function deleteProduct(productId: string): Promise<AdminResult> {
  try {
    await requireAdmin();
    await prisma.product.delete({ where: { id: productId } });
    revalidatePath("/admin/products");
    return { success: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<AdminResult> {
  try {
    await requireAdmin();
    await prisma.order.update({ where: { id: orderId }, data: { status } });
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function createCategory(name: string, parentId?: string): Promise<AdminResult> {
  try {
    await requireAdmin();
    const c = await prisma.category.create({
      data: { name, slug: slugify(name), parentId: parentId || null },
    });
    revalidatePath("/admin/categories");
    return { success: true, id: c.id };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function createBrand(name: string): Promise<AdminResult> {
  try {
    await requireAdmin();
    const b = await prisma.brand.create({ data: { name, slug: slugify(name) } });
    revalidatePath("/admin/categories");
    return { success: true, id: b.id };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

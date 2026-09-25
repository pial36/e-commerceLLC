import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCategories, getBrands } from "@/server/services/category";
import { DEMO_PRODUCTS } from "@/lib/demo";
import { fromCents } from "@/lib/utils";
import { ProductForm } from "@/components/admin/product-form";

export const metadata = { title: "Edit Product" };

const DEMO_CATS = [
  { id: "cookware", name: "Cookware" },
  { id: "bakeware", name: "Bakeware" },
  { id: "appliances", name: "Appliances" },
  { id: "cutlery", name: "Cutlery" },
];
const DEMO_BRANDS = [
  { id: "wow-kitchen", name: "Wow Kitchen" },
  { id: "chefline", name: "ChefLine" },
];

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let categories = DEMO_CATS;
  let brands = DEMO_BRANDS;
  let initial: React.ComponentProps<typeof ProductForm>["initial"] | undefined;

  try {
    const [c, b, product] = await Promise.all([
      getCategories(),
      getBrands(),
      prisma.product.findUnique({
        where: { id },
        include: { images: { orderBy: { position: "asc" } }, variants: true },
      }),
    ]);
    if (c.length) categories = c.map((x) => ({ id: x.id, name: x.name }));
    if (b.length) brands = b.map((x) => ({ id: x.id, name: x.name }));
    if (product) {
      initial = {
        id: product.id,
        name: product.name,
        description: product.description,
        price: fromCents(product.price),
        discount: product.discount != null ? fromCents(product.discount) : null,
        sku: product.sku,
        stock: product.stock,
        categoryId: product.categoryId,
        brandId: product.brandId,
        isActive: product.isActive,
        isFeatured: product.isFeatured,
        images: product.images.map((i) => i.url),
        variants: product.variants.map((v) => ({
          name: v.name,
          color: v.color ?? "",
          size: v.size ?? "",
          sku: v.sku,
          price: v.price != null ? fromCents(v.price) : null,
          stock: v.stock,
        })),
      };
    }
  } catch {
    // DB not ready — demo fallback
  }

  if (!initial) {
    const demo = DEMO_PRODUCTS.find((p) => p.id === id);
    if (!demo) notFound();
    initial = {
      id: demo.id,
      name: demo.name,
      description: demo.description,
      price: fromCents(demo.price),
      discount: demo.discount != null ? fromCents(demo.discount) : null,
      sku: demo.sku,
      stock: demo.stock,
      categoryId: demo.categoryId,
      brandId: demo.brandId,
      isActive: demo.isActive,
      isFeatured: demo.isFeatured,
      images: demo.images.map((i) => i.url),
      variants: demo.variants.map((v) => ({
        name: v.name,
        color: v.color ?? "",
        size: v.size ?? "",
        sku: v.sku,
        price: v.price != null ? fromCents(v.price) : null,
        stock: v.stock,
      })),
    };
  }

  return (
    <div className="space-y-6">
      <Link href="/admin/products" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to products
      </Link>
      <h1 className="font-display text-2xl font-bold">Edit product</h1>
      <ProductForm categories={categories} brands={brands} initial={initial} />
    </div>
  );
}

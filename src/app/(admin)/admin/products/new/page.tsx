import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCategories, getBrands } from "@/server/services/category";
import { ProductForm } from "@/components/admin/product-form";

export const metadata = { title: "New Product" };

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

export default async function NewProductPage() {
  let categories = DEMO_CATS;
  let brands = DEMO_BRANDS;
  try {
    const [c, b] = await Promise.all([getCategories(), getBrands()]);
    if (c.length) categories = c.map((x) => ({ id: x.id, name: x.name }));
    if (b.length) brands = b.map((x) => ({ id: x.id, name: x.name }));
  } catch {}

  return (
    <div className="space-y-6">
      <Link href="/admin/products" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to products
      </Link>
      <h1 className="font-display text-2xl font-bold">Add product</h1>
      <ProductForm categories={categories} brands={brands} />
    </div>
  );
}

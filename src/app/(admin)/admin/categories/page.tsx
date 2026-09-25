import { Tag, Package2 } from "lucide-react";
import { getCategories, getBrands } from "@/server/services/category";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddCategoryForm, AddBrandForm } from "@/components/admin/taxonomy-forms";

export const metadata = { title: "Categories & Brands" };

const DEMO_CATS = [
  { id: "cookware", name: "Cookware", count: 96 },
  { id: "bakeware", name: "Bakeware", count: 38 },
  { id: "appliances", name: "Appliances", count: 64 },
  { id: "cutlery", name: "Cutlery", count: 52 },
];
const DEMO_BRANDS = [
  { id: "wow-kitchen", name: "Wow Kitchen" },
  { id: "chefline", name: "ChefLine" },
];

export default async function AdminCategoriesPage() {
  let categories = DEMO_CATS;
  let brands = DEMO_BRANDS;
  try {
    const [c, b] = await Promise.all([getCategories(), getBrands()]);
    if (c.length) categories = c.map((x) => ({ id: x.id, name: x.name, count: x._count.products }));
    if (b.length) brands = b.map((x) => ({ id: x.id, name: x.name }));
  } catch {}

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Categories & Brands</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-4 w-4" /> Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <AddCategoryForm />
            <div className="space-y-2">
              {categories.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
                  <span className="text-sm font-medium">{c.name}</span>
                  <Badge variant="secondary">{c.count} products</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package2 className="h-4 w-4" /> Brands
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <AddBrandForm />
            <div className="space-y-2">
              {brands.map((b) => (
                <div key={b.id} className="rounded-lg bg-secondary/50 px-3 py-2 text-sm font-medium">
                  {b.name}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

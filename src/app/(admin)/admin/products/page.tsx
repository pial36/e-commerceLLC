import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { getAdminProducts } from "@/server/services/admin";
import { demoAdminProducts } from "@/lib/demo-admin";
import { formatPrice, effectivePrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductRowActions } from "@/components/admin/product-row-actions";

export const metadata = { title: "Products" };

type Row = {
  id: string;
  name: string;
  sku: string;
  price: number;
  discount: number | null;
  stock: number;
  isFeatured: boolean;
  isActive: boolean;
  category: { name: string };
  images: { url: string }[];
  _count: { variants: number };
};

export default async function AdminProductsPage() {
  let products: Row[] = demoAdminProducts();
  try {
    const live = await getAdminProducts();
    if (live.length > 0) {
      products = live.map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        price: Number(p.price),
        discount: p.discount ? Number(p.discount) : null,
        stock: p.stock,
        isFeatured: p.isFeatured,
        isActive: p.isActive,
        category: { name: p.category.name },
        images: p.images.map((i) => ({ url: i.url })),
        _count: p._count,
      }));
    }
  } catch {
    // DB not ready — demo
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground">{products.length} products</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4" /> Add product
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 overflow-hidden rounded-md bg-secondary">
                        <Image
                          src={p.images[0]?.url ?? "/placeholder.svg"}
                          alt={p.name}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">{p.name}</p>
                        {p._count.variants > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {p._count.variants} variants
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{p.sku}</TableCell>
                  <TableCell>{p.category.name}</TableCell>
                  <TableCell>{formatPrice(effectivePrice(p.price, p.discount))}</TableCell>
                  <TableCell>
                    <span className={p.stock <= 10 ? "font-medium text-destructive" : ""}>
                      {p.stock}
                    </span>
                  </TableCell>
                  <TableCell>
                    {p.isActive ? (
                      <Badge variant={p.isFeatured ? "default" : "secondary"}>
                        {p.isFeatured ? "Featured" : "Active"}
                      </Badge>
                    ) : (
                      <Badge variant="outline">Draft</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <ProductRowActions id={p.id} name={p.name} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

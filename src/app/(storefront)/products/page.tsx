import Link from "next/link";
import { Suspense } from "react";
import { getProducts } from "@/server/services/product";
import { ProductCard } from "@/components/storefront/product-card";
import { ProductFiltersPanel } from "@/components/storefront/product-filters";
import { SortSelect } from "@/components/storefront/sort-select";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { DEMO_PRODUCTS } from "@/lib/demo";
import { effectivePrice, toCents } from "@/lib/utils";
import type { ProductFilters, ProductWithRelations } from "@/types";

function demoFiltered(f: ProductFilters): ProductWithRelations[] {
  let list = [...DEMO_PRODUCTS];
  if (f.q) list = list.filter((p) => p.name.toLowerCase().includes(f.q!.toLowerCase()));
  if (f.category) list = list.filter((p) => p.categoryId === f.category);
  if (f.minRating) list = list.filter((p) => p.rating >= f.minRating!);
  if (f.minPrice) list = list.filter((p) => effectivePrice(p.price, p.discount) >= f.minPrice!);
  if (f.maxPrice) list = list.filter((p) => effectivePrice(p.price, p.discount) <= f.maxPrice!);
  if (f.sort === "price-asc") list.sort((a, b) => effectivePrice(a.price, a.discount) - effectivePrice(b.price, b.discount));
  else if (f.sort === "price-desc") list.sort((a, b) => effectivePrice(b.price, b.discount) - effectivePrice(a.price, a.discount));
  else if (f.sort === "rating") list.sort((a, b) => b.rating - a.rating);
  else if (f.sort === "featured") list.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));
  return list;
}

export const metadata = { title: "Products" };

type SearchParams = Promise<Record<string, string | undefined>>;

function parse(sp: Record<string, string | undefined>): ProductFilters {
  return {
    q: sp.q,
    category: sp.category,
    brand: sp.brand,
    minPrice: sp.minPrice ? toCents(Number(sp.minPrice)) : undefined,
    maxPrice: sp.maxPrice ? toCents(Number(sp.maxPrice)) : undefined,
    minRating: sp.minRating ? Number(sp.minRating) : undefined,
    sort: (sp.sort as ProductFilters["sort"]) ?? "newest",
    page: sp.page ? Number(sp.page) : 1,
  };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const filters = parse(sp);

  let products: ProductWithRelations[] = [];
  let total = 0;
  let totalPages = 1;
  const page = filters.page ?? 1;
  try {
    const res = await getProducts(filters);
    products = res.products;
    total = res.total;
    totalPages = res.totalPages;
  } catch {
    // DB not ready
  }
  if (products.length === 0) {
    products = demoFiltered(filters);
    total = products.length;
    totalPages = 1;
  }

  const buildPageHref = (p: number) => {
    const next = new URLSearchParams(sp as Record<string, string>);
    next.set("page", String(p));
    return `/products?${next.toString()}`;
  };

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold">All Products</h1>
        <p className="mt-1 text-muted-foreground">{total} items</p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
        <Suspense>
          <ProductFiltersPanel />
        </Suspense>

        <div>
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filters.q && `Results for "${filters.q}"`}
            </p>
            <Suspense>
              <SortSelect />
            </Suspense>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 gap-5 md:grid-cols-3">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed p-16 text-center text-muted-foreground">
              No products found. Adjust filters or seed the database.
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <Button
                  key={i}
                  asChild
                  variant={page === i + 1 ? "default" : "outline"}
                  size="icon"
                >
                  <Link href={buildPageHref(i + 1)}>{i + 1}</Link>
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-5 md:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="aspect-[3/4]" />
      ))}
    </div>
  );
}

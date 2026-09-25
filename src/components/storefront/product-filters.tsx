"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useCallback } from "react";
import { Star } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { formatPrice, toCents, cn } from "@/lib/utils";

const CATEGORIES = [
  { name: "Cookware", slug: "cookware" },
  { name: "Bakeware", slug: "bakeware" },
  { name: "Appliances", slug: "appliances" },
  { name: "Cutlery", slug: "cutlery" },
];
const MAX_PRICE = 1000;

export function ProductFiltersPanel() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const activeCategory = params.get("category") ?? "";
  const activeRating = Number(params.get("minRating") ?? 0);
  const [range, setRange] = useState<[number, number]>([
    Number(params.get("minPrice") ?? 0),
    Number(params.get("maxPrice") ?? MAX_PRICE),
  ]);

  const setParam = useCallback(
    (updates: Record<string, string | null>) => {
      const next = new URLSearchParams(params.toString());
      for (const [k, v] of Object.entries(updates)) {
        if (v === null || v === "") next.delete(k);
        else next.set(k, v);
      }
      next.delete("page");
      router.push(`${pathname}?${next.toString()}`);
    },
    [params, pathname, router]
  );

  return (
    <aside className="space-y-8">
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide">Category</h3>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => setParam({ category: null })}
              className={cn(
                "text-sm text-muted-foreground hover:text-foreground",
                !activeCategory && "font-semibold text-foreground"
              )}
            >
              All products
            </button>
          </li>
          {CATEGORIES.map((c) => (
            <li key={c.slug}>
              <button
                onClick={() => setParam({ category: c.slug })}
                className={cn(
                  "text-sm text-muted-foreground hover:text-foreground",
                  activeCategory === c.slug && "font-semibold text-foreground"
                )}
              >
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide">Price</h3>
        <Slider
          min={0}
          max={MAX_PRICE}
          step={10}
          value={range}
          onValueChange={(v) => setRange(v as [number, number])}
          onValueCommit={(v) =>
            setParam({ minPrice: String(v[0]), maxPrice: String(v[1]) })
          }
        />
        <div className="mt-3 flex justify-between text-sm text-muted-foreground">
          <span>{formatPrice(toCents(range[0]))}</span>
          <span>{formatPrice(toCents(range[1]))}</span>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide">Rating</h3>
        <ul className="space-y-1">
          {[4, 3, 2, 1].map((r) => (
            <li key={r}>
              <button
                onClick={() => setParam({ minRating: activeRating === r ? null : String(r) })}
                className={cn(
                  "flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground",
                  activeRating === r && "font-semibold text-foreground"
                )}
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-3.5 w-3.5",
                      i < r ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"
                    )}
                  />
                ))}
                <span className="ml-1">& up</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <Button variant="outline" className="w-full" onClick={() => router.push(pathname)}>
        Clear filters
      </Button>
    </aside>
  );
}

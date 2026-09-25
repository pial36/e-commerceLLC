"use client";

import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import type { ProductWithRelations } from "@/types";
import { formatPrice, effectivePrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/store/cart";

export function ProductCard({ product }: { product: ProductWithRelations }) {
  const addItem = useCart((s) => s.addItem);
  const price = effectivePrice(product.price, product.discount);
  const hasDiscount = product.discount != null && product.discount > 0;
  const img = product.images[0]?.url ?? "/placeholder.svg";

  const quickAdd = () =>
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: img,
      price,
      quantity: 1,
      maxStock: product.stock || 99,
    });

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card transition-shadow hover:shadow-md">
      <Link href={`/products/${product.slug}`} className="relative block aspect-square bg-secondary/60">
        <Image
          src={img}
          alt={product.name}
          fill
          sizes="(max-width:768px) 50vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {hasDiscount && (
          <Badge variant="destructive" className="absolute left-3 top-3">
            Sale
          </Badge>
        )}
        {product.stock === 0 && (
          <Badge variant="secondary" className="absolute right-3 top-3">
            Out of stock
          </Badge>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs text-muted-foreground">{product.category.name}</p>
        <Link href={`/products/${product.slug}`}>
          <h3 className="mt-1 line-clamp-1 font-medium hover:underline">{product.name}</h3>
        </Link>
        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          {product.rating.toFixed(1)} ({product.reviewCount})
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-semibold">{formatPrice(price)}</span>
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
        </div>
        <Button
          className="mt-3 w-full"
          size="sm"
          disabled={product.stock === 0}
          onClick={quickAdd}
        >
          {product.stock === 0 ? "Sold out" : "Add to cart"}
        </Button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, Minus, Plus, Check, Truck, ShieldCheck } from "lucide-react";
import type { ProductDetail } from "@/types";
import { formatPrice, effectivePrice, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/store/cart";

export function ProductDetailView({ product }: { product: ProductDetail }) {
  const addItem = useCart((s) => s.addItem);
  const images = product.images.length
    ? product.images
    : [{ id: "ph", url: "/placeholder.svg", alt: product.name, position: 0, productId: product.id }];

  const [activeImg, setActiveImg] = useState(0);
  const [variantId, setVariantId] = useState<string | undefined>(
    product.variants[0]?.id
  );
  const [qty, setQty] = useState(1);

  const variant = product.variants.find((v) => v.id === variantId);
  const basePrice = effectivePrice(product.price, product.discount);
  const price = variant?.price ?? basePrice;
  const stock = variant?.stock ?? product.stock;
  const hasDiscount = product.discount != null && product.discount > 0 && !variant?.price;

  const add = () =>
    addItem({
      productId: product.id,
      variantId,
      name: product.name,
      slug: product.slug,
      image: images[0].url,
      price,
      quantity: qty,
      variantLabel: variant?.name,
      maxStock: stock || 99,
    });

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      {/* Gallery */}
      <div className="space-y-4">
        <div className="group relative aspect-square overflow-hidden rounded-2xl bg-secondary/60">
          <Image
            src={images[activeImg].url}
            alt={images[activeImg].alt ?? product.name}
            fill
            sizes="(max-width:1024px) 100vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            priority
          />
        </div>
        {images.length > 1 && (
          <div className="grid grid-cols-5 gap-3">
            {images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setActiveImg(i)}
                className={cn(
                  "relative aspect-square overflow-hidden rounded-lg border-2 bg-secondary/60",
                  activeImg === i ? "border-primary" : "border-transparent"
                )}
              >
                <Image src={img.url} alt="" fill sizes="20vw" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="space-y-6">
        <div>
          <p className="text-sm text-muted-foreground">{product.category.name}</p>
          <h1 className="mt-1 font-display text-3xl font-bold md:text-4xl">{product.name}</h1>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-4 w-4",
                    i < Math.round(product.rating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground/40"
                  )}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {product.rating.toFixed(1)} · {product.reviewCount} reviews
            </span>
          </div>
        </div>

        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold">{formatPrice(price)}</span>
          {hasDiscount && (
            <span className="text-lg text-muted-foreground line-through">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {product.description && (
          <p className="text-muted-foreground">{product.description}</p>
        )}

        {/* Variants */}
        {product.variants.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium">Options</p>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setVariantId(v.id)}
                  disabled={v.stock === 0}
                  className={cn(
                    "rounded-md border px-3 py-2 text-sm transition-colors disabled:opacity-40",
                    variantId === v.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input hover:border-primary"
                  )}
                >
                  {v.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stock */}
        <div className="text-sm">
          {stock > 0 ? (
            <span className="inline-flex items-center gap-1 text-emerald-600">
              <Check className="h-4 w-4" /> In stock ({stock} available)
            </span>
          ) : (
            <Badge variant="secondary">Out of stock</Badge>
          )}
        </div>

        {/* Qty + add */}
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-md border border-input">
            <Button variant="ghost" size="icon" onClick={() => setQty((q) => Math.max(1, q - 1))}>
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-10 text-center text-sm">{qty}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setQty((q) => Math.min(stock, q + 1))}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <Button size="lg" className="flex-1" disabled={stock === 0} onClick={add}>
            Add to cart · {formatPrice(price * qty)}
          </Button>
        </div>

        <Separator />
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Truck className="h-5 w-5" /> Free shipping over $75
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <ShieldCheck className="h-5 w-5" /> 2-year warranty
          </div>
        </div>

        {/* Specs */}
        {product.specs.length > 0 && (
          <div>
            <h3 className="mb-3 font-semibold">Specifications</h3>
            <table className="w-full text-sm">
              <tbody>
                {product.specs.map((s) => (
                  <tr key={s.id} className="border-b border-border/60">
                    <td className="py-2 pr-4 text-muted-foreground">{s.key}</td>
                    <td className="py-2 font-medium">{s.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

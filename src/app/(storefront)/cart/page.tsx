"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { useCart, cartSubtotal } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const SHIPPING_FREE_OVER = 7500; // cents ($75)
const SHIPPING_FLAT = 999; // cents ($9.99)

export default function CartPage() {
  const { items, updateQty, removeItem } = useCart();
  const subtotal = cartSubtotal(items);
  const shipping = subtotal >= SHIPPING_FREE_OVER || subtotal === 0 ? 0 : SHIPPING_FLAT;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="container flex flex-col items-center gap-4 py-24 text-center">
        <h1 className="font-display text-3xl font-bold">Your cart is empty</h1>
        <p className="text-muted-foreground">Add some kitchen essentials to get started.</p>
        <Button asChild size="lg">
          <Link href="/products">Browse products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="mb-8 font-display text-4xl font-bold">Shopping Cart</h1>
      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {items.map((i) => (
            <div
              key={`${i.productId}-${i.variantId ?? ""}`}
              className="flex gap-4 rounded-xl border border-border/60 bg-card p-4"
            >
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-secondary">
                <Image src={i.image} alt={i.name} fill sizes="96px" className="object-cover" />
              </div>
              <div className="flex flex-1 flex-col">
                <div className="flex justify-between gap-3">
                  <div>
                    <Link href={`/products/${i.slug}`} className="font-medium hover:underline">
                      {i.name}
                    </Link>
                    {i.variantLabel && (
                      <p className="text-sm text-muted-foreground">{i.variantLabel}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeItem(i.productId, i.variantId)}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQty(i.productId, i.variantId, i.quantity - 1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center">{i.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQty(i.productId, i.variantId, i.quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <span className="font-semibold">{formatPrice(i.price * i.quantity)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="h-fit rounded-xl border border-border/60 bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
          <Button asChild className="mt-6 w-full" size="lg">
            <Link href="/checkout">
              Proceed to Checkout <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="link" className="mt-2 w-full">
            <Link href="/products">Continue shopping</Link>
          </Button>
        </aside>
      </div>
    </div>
  );
}

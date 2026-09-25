"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useCart, cartSubtotal } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { addressSchema, type AddressInput } from "@/lib/validations/checkout";
import { placeOrder } from "@/server/actions/checkout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const SHIPPING_FREE_OVER = 7500; // cents ($75)
const SHIPPING_FLAT = 999; // cents ($9.99)

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clear } = useCart();
  const [promo, setPromo] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const subtotal = cartSubtotal(items);
  const shipping = subtotal >= SHIPPING_FREE_OVER || subtotal === 0 ? 0 : SHIPPING_FLAT;
  const total = subtotal + shipping;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: { country: "USA" },
  });

  const onSubmit = async (address: AddressInput) => {
    setServerError(null);
    setSubmitting(true);
    const res = await placeOrder({
      address,
      items: items.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
      })),
      promoCode: promo || undefined,
    });
    setSubmitting(false);

    if (res.error) {
      setServerError(res.error);
      return;
    }
    clear();
    if (res.redirectUrl) {
      if (res.redirectUrl.startsWith("http")) window.location.href = res.redirectUrl;
      else router.push(res.redirectUrl);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container flex flex-col items-center gap-4 py-24 text-center">
        <h1 className="font-display text-3xl font-bold">Nothing to check out</h1>
        <Button asChild>
          <Link href="/products">Browse products</Link>
        </Button>
      </div>
    );
  }

  const field = (
    name: keyof AddressInput,
    label: string,
    opts: { colSpan?: boolean; type?: string } = {}
  ) => (
    <div className={opts.colSpan ? "sm:col-span-2" : ""}>
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} type={opts.type ?? "text"} className="mt-1.5" {...register(name)} />
      {errors[name] && (
        <p className="mt-1 text-xs text-destructive">{errors[name]?.message}</p>
      )}
    </div>
  );

  return (
    <div className="container py-10">
      <h1 className="mb-8 font-display text-4xl font-bold">Checkout</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <div>
          <h2 className="mb-4 text-lg font-semibold">Shipping Address</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {field("fullName", "Full name", { colSpan: true })}
            {field("phone", "Phone")}
            {field("postalCode", "Postal code")}
            {field("line1", "Address line 1", { colSpan: true })}
            {field("line2", "Address line 2 (optional)", { colSpan: true })}
            {field("city", "City")}
            {field("state", "State")}
            {field("country", "Country")}
          </div>
          {serverError && (
            <p className="mt-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {serverError}{" "}
              {serverError.includes("sign in") && (
                <Link href="/login" className="underline">
                  Sign in
                </Link>
              )}
            </p>
          )}
        </div>

        <aside className="h-fit rounded-xl border border-border/60 bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Order Summary</h2>
          <div className="max-h-56 space-y-3 overflow-y-auto">
            {items.map((i) => (
              <div key={`${i.productId}-${i.variantId ?? ""}`} className="flex justify-between text-sm">
                <span className="line-clamp-1 text-muted-foreground">
                  {i.name} × {i.quantity}
                </span>
                <span>{formatPrice(i.price * i.quantity)}</span>
              </div>
            ))}
          </div>
          <Separator className="my-4" />
          <div className="mb-4 flex gap-2">
            <Input
              placeholder="Promo code"
              value={promo}
              onChange={(e) => setPromo(e.target.value)}
            />
          </div>
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
          <Button type="submit" className="mt-6 w-full" size="lg" disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Place Order
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Secure checkout. Payment on next step.
          </p>
        </aside>
      </form>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, ShoppingBag, User, Menu, ChefHat } from "lucide-react";
import { useCart, cartCount } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CartDrawer } from "./cart-drawer";

const NAV = [
  { label: "Cookware", href: "/products?category=cookware" },
  { label: "Bakeware", href: "/products?category=bakeware" },
  { label: "Appliances", href: "/products?category=appliances" },
  { label: "Cutlery", href: "/products?category=cutlery" },
  { label: "Recipes", href: "/#recipes" },
];

export function Navbar() {
  const items = useCart((s) => s.items);
  const setOpen = useCart((s) => s.setOpen);
  const [mobileOpen, setMobileOpen] = useState(false);
  const count = cartCount(items);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold">
            <ChefHat className="h-6 w-6" />
            <span>Masud Rana</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {NAV.map((n) => (
              <Link
                key={n.label}
                href={n.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1">
          <form action="/products" className="hidden lg:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="q"
                placeholder="Search products…"
                className="w-56 pl-9 bg-secondary/50"
              />
            </div>
          </form>
          <Button asChild variant="ghost" size="icon">
            <Link href="/account" aria-label="Account">
              <User className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" className="relative" onClick={() => setOpen(true)}>
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {count}
              </span>
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-border/60 bg-background px-6 py-3 md:hidden">
          {NAV.map((n) => (
            <Link
              key={n.label}
              href={n.href}
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-sm font-medium"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      )}

      <CartDrawer />
    </header>
  );
}

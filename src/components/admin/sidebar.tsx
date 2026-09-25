"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  Tag,
  Store,
  ChefHat,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MAIN = [
  { href: "/admin", label: "Overview", icon: LayoutGrid },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/categories", label: "Categories", icon: Tag },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const link = (l: { href: string; label: string; icon: typeof LayoutGrid }) => {
    const active = pathname === l.href;
    return (
      <Link
        key={l.href}
        href={l.href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          active
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
        )}
      >
        <l.icon className="h-4 w-4" /> {l.label}
      </Link>
    );
  };

  return (
    <aside className="hidden w-60 shrink-0 border-r border-border/60 bg-card lg:block">
      <div className="flex h-16 items-center gap-2 border-b border-border/60 px-6 font-display text-lg font-bold">
        <ChefHat className="h-5 w-5" /> Masud Rana
      </div>
      <nav className="space-y-6 p-4">
        <div>
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Main Menu
          </p>
          <div className="space-y-1">{MAIN.map(link)}</div>
        </div>
        <div>
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Sales Channel
          </p>
          <div className="space-y-1">
            <Link
              href="/admin"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary"
            >
              <Store className="h-4 w-4" /> Online Store
            </Link>
            <Link
              href="/"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary"
            >
              <BarChart3 className="h-4 w-4" /> View Storefront
            </Link>
          </div>
        </div>
      </nav>
    </aside>
  );
}

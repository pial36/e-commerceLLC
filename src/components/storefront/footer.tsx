import Link from "next/link";
import { ChefHat } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border/60 bg-secondary/40">
      <div className="container grid gap-10 py-14 md:grid-cols-4">
        <div className="space-y-3">
          <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold">
            <ChefHat className="h-5 w-5" /> Masud Rana LLC
          </Link>
          <p className="text-sm text-muted-foreground">
            Make something beautiful with the best kitchen brand right now.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Shop</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/products?category=cookware" className="hover:text-foreground">Cookware</Link></li>
            <li><Link href="/products?category=bakeware" className="hover:text-foreground">Bakeware</Link></li>
            <li><Link href="/products?category=appliances" className="hover:text-foreground">Appliances</Link></li>
            <li><Link href="/products?category=cutlery" className="hover:text-foreground">Cutlery</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Company</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/about" className="hover:text-foreground">About</Link></li>
            <li><Link href="/products" className="hover:text-foreground">All products</Link></li>
            <li><Link href="/account/orders" className="hover:text-foreground">Track order</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Contact us</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Contact@masudrana.com</li>
            <li>39 Brooklyn Street</li>
            <li>Covington, VA 24426</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Masud Rana LLC. All rights reserved.
      </div>
    </footer>
  );
}

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, ShieldCheck, Palette, Hand } from "lucide-react";
import { getFeaturedProducts } from "@/server/services/product";
import { getCategories } from "@/server/services/category";
import { ProductCard } from "@/components/storefront/product-card";
import { SectionHeading } from "@/components/storefront/section-heading";
import { Button } from "@/components/ui/button";
import { demoFeatured } from "@/lib/demo";
import type { ProductWithRelations } from "@/types";

const HERO_IMG =
  "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1000&q=75";

const FALLBACK_CATEGORIES = [
  { name: "Cookware", slug: "cookware" },
  { name: "Bakeware", slug: "bakeware" },
  { name: "Appliances", slug: "appliances" },
  { name: "Cutlery", slug: "cutlery" },
];

const WHY = [
  { icon: Hand, title: "Innovative, Touch-Activated Display Appliances" },
  { icon: Sparkles, title: "Thoughtfully-Designed Modern Silhouettes" },
  { icon: ShieldCheck, title: "Responsible, Durable Construction Made To Last" },
  { icon: Palette, title: "Contemporary Colors For Every Counter" },
];

export default async function HomePage() {
  let featured: ProductWithRelations[] = [];
  let categories = FALLBACK_CATEGORIES;
  try {
    [featured, categories] = await Promise.all([
      getFeaturedProducts(8),
      getCategories().then((c) =>
        c.length ? c.map((x) => ({ name: x.name, slug: x.slug })) : FALLBACK_CATEGORIES
      ),
    ]);
  } catch {
    // DB not ready yet — render static shell
  }
  if (featured.length === 0) featured = demoFeatured(8);

  return (
    <>
      {/* Hero */}
      <section className="container grid items-center gap-8 py-14 md:grid-cols-2 md:py-20">
        <div className="space-y-6">
          <p className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5" /> 15% Discount on first order
          </p>
          <h1 className="font-display text-5xl font-bold leading-[1.05] md:text-6xl">
            Set Out Life{" "}
            <span className="rounded-md bg-primary px-2 text-primary-foreground">Beautiful</span>{" "}
            Through Cooking.
          </h1>
          <p className="max-w-md text-muted-foreground">
            Premium cookware, bakeware, appliances, and cutlery — engineered for original
            style and quality you can&apos;t find anywhere else.
          </p>
          <div className="flex gap-3">
            <Button asChild size="lg">
              <Link href="/products">
                Shop Our Collection <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/products?sort=featured">Best Sellers</Link>
            </Button>
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            ✦ +708k Happy Customers
          </p>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-secondary">
          <Image
            src={HERO_IMG}
            alt="Chef cooking with premium cookware"
            fill
            priority
            sizes="(max-width:768px) 100vw, 50vw"
            className="object-cover"
          />
          <div className="absolute bottom-4 left-4 rounded-lg bg-background/90 px-4 py-2 text-sm font-semibold shadow">
            15% Discount
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container py-10">
        <SectionHeading title="A Color For Every Counter" subtitle="Shop by category" />
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/products?category=${c.slug}`}
              className="group relative flex aspect-[4/3] items-end overflow-hidden rounded-xl bg-secondary p-5 transition-colors hover:bg-accent/50"
            >
              <span className="font-display text-lg font-semibold">{c.name}</span>
              <ArrowRight className="absolute right-4 top-4 h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          ))}
        </div>
      </section>

      {/* Why us */}
      <section className="bg-secondary/40 py-16">
        <div className="container grid gap-8 md:grid-cols-2 md:items-center">
          <div className="space-y-4">
            <SectionHeading
              title="Why you'll love Masud Rana"
              subtitle="All of our products are designed and manufactured in-house for original style and quality that you can't find anywhere else."
            />
            <Button asChild variant="outline">
              <Link href="/about">Learn more</Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {WHY.map((w) => (
              <div key={w.title} className="rounded-xl border border-border/60 bg-card p-5">
                <w.icon className="h-6 w-6" />
                <p className="mt-3 text-sm font-medium">{w.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Best sellers */}
      <section id="bestsellers" className="container py-16">
        <SectionHeading title="Best Sellers" center />
        {featured.length > 0 ? (
          <div className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <p className="mt-10 text-center text-muted-foreground">
            Seed the database to display products (npm run db:seed).
          </p>
        )}
        <div className="mt-10 text-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/products">View all products</Link>
          </Button>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h3 className="font-display text-3xl font-bold">
              Stay Up To Date On All News And Offers.
            </h3>
            <p className="mt-2 text-primary-foreground/70">
              Be the first to know about new collections and special events.
            </p>
          </div>
          <form className="flex w-full max-w-md gap-2">
            <input
              type="email"
              required
              placeholder="Email address"
              className="h-11 flex-1 rounded-md bg-primary-foreground px-4 text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <Button type="submit" variant="secondary" size="lg">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </section>
    </>
  );
}

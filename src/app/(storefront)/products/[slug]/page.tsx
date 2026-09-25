import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug, getRelatedProducts } from "@/server/services/product";
import { ProductDetailView } from "@/components/storefront/product-detail";
import { ProductCard } from "@/components/storefront/product-card";
import { SectionHeading } from "@/components/storefront/section-heading";
import { Separator } from "@/components/ui/separator";
import { Star } from "lucide-react";
import { demoDetail, demoRelated } from "@/lib/demo";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await getProductBySlug(slug);
    if (product) return { title: product.name, description: product.description ?? undefined };
  } catch {}
  return { title: "Product" };
}

export default async function ProductDetailPage({ params }: { params: Params }) {
  const { slug } = await params;

  let product;
  try {
    product = await getProductBySlug(slug);
  } catch {
    // DB not ready
  }
  if (!product) product = demoDetail(slug);
  if (!product) notFound();

  let related: Awaited<ReturnType<typeof getRelatedProducts>> = [];
  try {
    related = await getRelatedProducts(product.category.id, product.id, 4);
  } catch {}
  if (related.length === 0) related = demoRelated(product.category.id, product.id, 4);

  return (
    <div className="container py-10">
      <ProductDetailView product={product} />

      {/* Reviews */}
      <section className="mt-16">
        <SectionHeading title="Customer Reviews" />
        <div className="mt-6 space-y-6">
          {product.reviews.length > 0 ? (
            product.reviews.map((r) => (
              <div key={r.id} className="rounded-xl border border-border/60 p-5">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{r.user.name ?? "Anonymous"}</p>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={
                          i < r.rating
                            ? "h-4 w-4 fill-amber-400 text-amber-400"
                            : "h-4 w-4 text-muted-foreground/40"
                        }
                      />
                    ))}
                  </div>
                </div>
                {r.comment && <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>}
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">No reviews yet. Be the first to review.</p>
          )}
        </div>
      </section>

      {related.length > 0 && (
        <>
          <Separator className="my-16" />
          <section>
            <SectionHeading title="Related Kitchen Items" />
            <div className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

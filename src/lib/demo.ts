import type { ProductWithRelations, ProductDetail } from "@/types";

const U = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=70`;

type Seed = {
  id: string;
  name: string;
  slug: string;
  cat: string;
  catSlug: string;
  price: number;
  discount?: number;
  rating: number;
  reviews: number;
  img: string;
  featured?: boolean;
};

const SEEDS: Seed[] = [
  { id: "d1", name: "Covered One Pot", slug: "covered-one-pot", cat: "Cookware", catSlug: "cookware", price: 89.94, discount: 69.94, rating: 4.8, reviews: 128, img: "photo-1585515320310-259814833e62", featured: true },
  { id: "d2", name: "Covered Fry Pan", slug: "covered-fry-pan", cat: "Cookware", catSlug: "cookware", price: 55.34, rating: 4.6, reviews: 96, img: "photo-1556910103-1c02745aae4d", featured: true },
  { id: "d3", name: "Jumbo Cooker", slug: "jumbo-cooker", cat: "Cookware", catSlug: "cookware", price: 41.54, rating: 4.7, reviews: 74, img: "photo-1574269909862-7e1d70bb8078", featured: true },
  { id: "d4", name: "10-Piece Non-Stick Set", slug: "10-piece-non-stick-set", cat: "Cookware", catSlug: "cookware", price: 199, discount: 169, rating: 4.9, reviews: 210, img: "photo-1556909212-d5b604d0c90d", featured: true },
  { id: "d5", name: "1.7L Programmable Kettle", slug: "1-7l-programmable-kettle", cat: "Appliances", catSlug: "appliances", price: 79.99, discount: 64.99, rating: 4.7, reviews: 143, img: "photo-1594213114663-d94db9b17125", featured: true },
  { id: "d6", name: "2-Slice Smart Toaster", slug: "2-slice-smart-toaster", cat: "Appliances", catSlug: "appliances", price: 59, rating: 4.5, reviews: 87, img: "photo-1626074353765-517a681e40be", featured: true },
  { id: "d7", name: "8-Piece Knife Block Set", slug: "8-piece-knife-block-set", cat: "Cutlery", catSlug: "cutlery", price: 149, discount: 119, rating: 4.9, reviews: 176, img: "photo-1593618998160-e34014e67546", featured: true },
  { id: "d8", name: "Ceramic Baking Dish", slug: "ceramic-baking-dish", cat: "Bakeware", catSlug: "bakeware", price: 34.5, rating: 4.4, reviews: 52, img: "photo-1607478900766-efe13248b125", featured: true },
  { id: "d9", name: "Programmable Coffee Maker", slug: "programmable-coffee-maker", cat: "Appliances", catSlug: "appliances", price: 129, rating: 4.8, reviews: 118, img: "photo-1517914309068-500c6f5f0b5b" },
  { id: "d10", name: "Muffin Tray 12-Cup", slug: "muffin-tray-12-cup", cat: "Bakeware", catSlug: "bakeware", price: 22, rating: 4.3, reviews: 41, img: "photo-1519915028121-7d3463d20b13" },
  { id: "d11", name: "Chef Knife 8-inch", slug: "chef-knife-8-inch", cat: "Cutlery", catSlug: "cutlery", price: 45, rating: 4.6, reviews: 63, img: "photo-1566454825481-9c31bb08a1e5" },
  { id: "d12", name: "Non-Stick Fry Pan", slug: "non-stick-fry-pan", cat: "Cookware", catSlug: "cookware", price: 29.94, rating: 4.5, reviews: 58, img: "photo-1584990347449-a2d4c2c9c9e5" },
];

const cents = (d: number) => Math.round(d * 100);

function toProduct(s: Seed): ProductWithRelations {
  return {
    id: s.id,
    name: s.name,
    slug: s.slug,
    description: `${s.name} — premium kitchen quality from Masud Rana LLC. Engineered for durability and everyday style.`,
    price: cents(s.price),
    discount: s.discount != null ? cents(s.discount) : null,
    sku: `MRL-${s.id.toUpperCase()}`,
    stock: 25,
    isActive: true,
    isFeatured: s.featured ?? false,
    rating: s.rating,
    reviewCount: s.reviews,
    categoryId: s.catSlug,
    brandId: "wow-kitchen",
    createdAt: new Date(),
    updatedAt: new Date(),
    images: [{ id: `${s.id}-img`, url: U(s.img), alt: s.name, position: 0, productId: s.id }],
    category: { id: s.catSlug, name: s.cat, slug: s.catSlug },
    brand: { id: "wow-kitchen", name: "Wow Kitchen", slug: "wow-kitchen" },
    variants:
      s.catSlug === "cookware"
        ? [
            { id: `${s.id}-blk`, productId: s.id, name: "Black", color: "Black", size: null, sku: `${s.id}-BLK`, price: null, stock: 12 },
            { id: `${s.id}-crm`, productId: s.id, name: "Cream", color: "Cream", size: null, sku: `${s.id}-CRM`, price: null, stock: 8 },
          ]
        : [],
  };
}

export const DEMO_PRODUCTS: ProductWithRelations[] = SEEDS.map(toProduct);

export function demoFeatured(limit = 8) {
  return DEMO_PRODUCTS.filter((p) => p.isFeatured).slice(0, limit);
}

export function demoDetail(slug: string): ProductDetail | null {
  const p = DEMO_PRODUCTS.find((x) => x.slug === slug);
  if (!p) return null;
  return {
    ...p,
    specs: [
      { id: `${p.id}-s1`, productId: p.id, key: "Material", value: "Stainless Steel / Non-Stick" },
      { id: `${p.id}-s2`, productId: p.id, key: "Warranty", value: "2 Years" },
      { id: `${p.id}-s3`, productId: p.id, key: "Dishwasher Safe", value: "Yes" },
    ],
    reviews: [
      {
        id: `${p.id}-r1`,
        productId: p.id,
        userId: "demo",
        rating: 5,
        comment: "Excellent quality, exactly as pictured. Highly recommend.",
        createdAt: new Date(),
        user: { name: "Jonathan A.", image: null },
      },
    ],
  };
}

export function demoRelated(catSlug: string, excludeId: string, limit = 4) {
  return DEMO_PRODUCTS.filter((p) => p.categoryId === catSlug && p.id !== excludeId).slice(0, limit);
}

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Money stored as integer cents.
const cents = (usd: number) => Math.round(usd * 100);

const IMG = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=70`;

const CATEGORIES = [
  { name: "Cookware", slug: "cookware" },
  { name: "Bakeware", slug: "bakeware" },
  { name: "Appliances", slug: "appliances" },
  { name: "Cutlery", slug: "cutlery" },
];

const BRANDS = [
  { name: "Wow Kitchen", slug: "wow-kitchen" },
  { name: "ChefLine", slug: "chefline" },
];

const PRODUCTS = [
  { name: "Covered One Pot", cat: "cookware", price: 89.94, discount: 69.94, rating: 4.8, img: "photo-1584990347449-a2d4c2c9c9e5", featured: true },
  { name: "Covered Fry Pan", cat: "cookware", price: 55.34, rating: 4.6, img: "photo-1556910103-1c02745aae4d", featured: true },
  { name: "Jumbo Cooker", cat: "cookware", price: 41.54, rating: 4.7, img: "photo-1585515320310-259814833e62", featured: true },
  { name: "Non-Stick Fry Pan", cat: "cookware", price: 29.94, rating: 4.5, img: "photo-1574269909862-7e1d70bb8078", featured: true },
  { name: "10-Piece Non-Stick Set", cat: "cookware", price: 199.0, discount: 169.0, rating: 4.9, img: "photo-1556909212-d5b604d0c90d", featured: true },
  { name: "Ceramic Baking Dish", cat: "bakeware", price: 34.5, rating: 4.4, img: "photo-1607478900766-efe13248b125", featured: true },
  { name: "Muffin Tray 12-Cup", cat: "bakeware", price: 22.0, rating: 4.3, img: "photo-1519915028121-7d3463d20b13" },
  { name: "1.7L Programmable Kettle", cat: "appliances", price: 79.99, discount: 64.99, rating: 4.7, img: "photo-1594213114663-d94db9b17125", featured: true },
  { name: "2-Slice Smart Toaster", cat: "appliances", price: 59.0, rating: 4.5, img: "photo-1626074353765-517a681e40be", featured: true },
  { name: "Programmable Coffee Maker", cat: "appliances", price: 129.0, rating: 4.8, img: "photo-1517914309068-500c6f5f0b5b" },
  { name: "8-Piece Knife Block Set", cat: "cutlery", price: 149.0, discount: 119.0, rating: 4.9, img: "photo-1593618998160-e34014e67546", featured: true },
  { name: "Chef Knife 8-inch", cat: "cutlery", price: 45.0, rating: 4.6, img: "photo-1566454825481-9c31bb08a1e5" },
];

async function main() {
  console.log("Seeding…");

  const adminPass = await bcrypt.hash("admin1234", 10);
  await prisma.user.upsert({
    where: { email: "admin@masudrana.com" },
    update: {},
    create: {
      email: "admin@masudrana.com",
      name: "Store Admin",
      role: "ADMIN",
      passwordHash: adminPass,
    },
  });

  const catMap: Record<string, string> = {};
  for (const c of CATEGORIES) {
    const row = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
    catMap[c.slug] = row.id;
  }

  const brand = await prisma.brand.upsert({
    where: { slug: BRANDS[0].slug },
    update: {},
    create: BRANDS[0],
  });
  await prisma.brand.upsert({
    where: { slug: BRANDS[1].slug },
    update: {},
    create: BRANDS[1],
  });

  for (const [i, p] of PRODUCTS.entries()) {
    const slug = p.name.toLowerCase().replace(/[^\w]+/g, "-");
    await prisma.product.upsert({
      where: { slug },
      update: {},
      create: {
        name: p.name,
        slug,
        description: `${p.name} — premium kitchen quality from Masud Rana LLC. Engineered for durability and everyday style.`,
        price: cents(p.price),
        discount: p.discount ? cents(p.discount) : null,
        sku: `MRL-${String(i + 1).padStart(4, "0")}`,
        stock: 25 + i,
        isFeatured: p.featured ?? false,
        rating: p.rating,
        reviewCount: 10 + i,
        categoryId: catMap[p.cat],
        brandId: brand.id,
        images: { create: [{ url: IMG(p.img), position: 0, alt: p.name }] },
        specs: {
          create: [
            { key: "Material", value: "Stainless Steel / Non-Stick" },
            { key: "Warranty", value: "2 Years" },
            { key: "Dishwasher Safe", value: "Yes" },
          ],
        },
        ...(p.cat === "cookware" && {
          variants: {
            create: [
              { name: "Black", color: "Black", sku: `MRL-${i + 1}-BLK`, stock: 12 },
              { name: "Cream", color: "Cream", sku: `MRL-${i + 1}-CRM`, stock: 8 },
            ],
          },
        }),
      },
    });
  }

  console.log("Seed complete. Admin: admin@masudrana.com / admin1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

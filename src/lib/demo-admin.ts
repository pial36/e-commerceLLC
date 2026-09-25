import type { DashboardStats } from "@/server/services/admin";
import { DEMO_PRODUCTS } from "@/lib/demo";
import type { OrderStatus } from "@prisma/client";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
// Dollar figures; converted to cents below.
const SALES_USD = [3200, 4100, 3800, 5200, 4800, 6100, 5600, 7200, 6800, 7500, 8100, 9200];
const c = (usd: number) => Math.round(usd * 100);

export const DEMO_STATS: DashboardStats = {
  totalProducts: 250,
  completedOrders: 124,
  canceledOrders: 14,
  topProductsCount: 119,
  revenue: c(44357),
  salesSeries: MONTHS.map((m, i) => ({ month: m, sales: c(SALES_USD[i]), orders: Math.round(SALES_USD[i] / 45) })),
  recentOrders: [
    { id: "o1", orderNumber: "MRL-8F3K2Q", customer: "Jonathan A.", total: c(599), status: "PROCESSING", createdAt: new Date("2024-02-12") },
    { id: "o2", orderNumber: "MRL-7A1B9C", customer: "Sarah M.", total: c(49), status: "DELIVERED", createdAt: new Date("2024-02-12") },
    { id: "o3", orderNumber: "MRL-3D4E5F", customer: "Michael R.", total: c(109), status: "SHIPPED", createdAt: new Date("2024-02-11") },
    { id: "o4", orderNumber: "MRL-6G7H8I", customer: "Emily K.", total: c(666), status: "PENDING", createdAt: new Date("2024-02-11") },
    { id: "o5", orderNumber: "MRL-9J0K1L", customer: "David L.", total: c(239), status: "DELIVERED", createdAt: new Date("2024-02-10") },
    { id: "o6", orderNumber: "MRL-2M3N4O", customer: "Anna P.", total: c(129), status: "CANCELLED", createdAt: new Date("2024-02-10") },
  ],
  lowStock: [
    { id: "d5", name: "1.7L Programmable Kettle", stock: 3, sku: "MRL-0008" },
    { id: "d7", name: "8-Piece Knife Block Set", stock: 5, sku: "MRL-0011" },
    { id: "d8", name: "Ceramic Baking Dish", stock: 8, sku: "MRL-0006" },
  ],
  topCategories: [
    { name: "Cookware", count: 96 },
    { name: "Appliances", count: 64 },
    { name: "Cutlery", count: 52 },
    { name: "Bakeware", count: 38 },
  ],
};

export function demoAdminProducts() {
  return DEMO_PRODUCTS.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    price: p.price,
    discount: p.discount,
    stock: p.stock,
    isActive: p.isActive,
    isFeatured: p.isFeatured,
    rating: p.rating,
    category: { name: p.category.name },
    images: p.images.map((i) => ({ url: i.url })),
    _count: { variants: p.variants.length },
  }));
}

export function demoAdminOrders(status?: OrderStatus) {
  const base = DEMO_STATS.recentOrders.map((o) => ({
    ...o,
    user: { name: o.customer, email: `${o.customer.split(" ")[0].toLowerCase()}@example.com` },
    items: [{ id: `${o.id}-i`, name: "Sample item", quantity: 1, price: o.total }],
    paymentStatus: (o.status === "PENDING" ? "UNPAID" : "PAID") as "PAID" | "UNPAID",
  }));
  return status ? base.filter((o) => o.status === status) : base;
}

export function demoAdminOrderDetail(id: string) {
  const found = DEMO_STATS.recentOrders.find((o) => o.id === id) ?? DEMO_STATS.recentOrders[0];
  const items = [
    { id: "i1", name: "Covered One Pot", quantity: 1, price: c(69.94), variant: "Black", slug: "covered-one-pot" },
    { id: "i2", name: "Chef Knife 8-inch", quantity: 2, price: c(45), variant: null, slug: "chef-knife-8-inch" },
  ];
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shippingCost = 999; // $9.99
  return {
    id: found.id,
    orderNumber: found.orderNumber,
    status: found.status,
    paymentStatus: found.status === "PENDING" ? "UNPAID" : "PAID",
    createdAt: found.createdAt,
    subtotal,
    shippingCost,
    discount: 0,
    total: subtotal + shippingCost,
    user: { name: found.customer, email: `${found.customer.split(" ")[0].toLowerCase()}@example.com` },
    shippingAddress: {
      fullName: found.customer,
      phone: "+1 555 019 2837",
      line1: "39 Brooklyn Street",
      line2: "Apt 4",
      city: "Covington",
      state: "VA",
      postalCode: "24426",
      country: "USA",
    },
    items,
  };
}

export function demoAdminCustomers() {
  return DEMO_STATS.recentOrders.map((o, i) => ({
    id: `c${i}`,
    name: o.customer,
    email: `${o.customer.split(" ")[0].toLowerCase()}@example.com`,
    image: null,
    createdAt: new Date(2024, 0, 10 + i),
    _count: { orders: 1 + (i % 4) },
  }));
}

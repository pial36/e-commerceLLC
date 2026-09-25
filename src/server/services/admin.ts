import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@prisma/client";

export type DashboardStats = {
  totalProducts: number;
  completedOrders: number;
  canceledOrders: number;
  topProductsCount: number;
  revenue: number;
  salesSeries: { month: string; sales: number; orders: number }[];
  recentOrders: {
    id: string;
    orderNumber: string;
    customer: string;
    total: number;
    status: OrderStatus;
    createdAt: Date;
  }[];
  lowStock: { id: string; name: string; stock: number; sku: string }[];
  topCategories: { name: string; count: number }[];
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export async function getDashboardStats(): Promise<DashboardStats> {
  const [
    totalProducts,
    completedOrders,
    canceledOrders,
    paidAgg,
    recent,
    lowStockRows,
    topCats,
    orders,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.order.count({ where: { status: { in: ["DELIVERED", "PROCESSING", "SHIPPED"] } } }),
    prisma.order.count({ where: { status: "CANCELLED" } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "PAID" } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.product.findMany({
      where: { stock: { lte: 10 } },
      orderBy: { stock: "asc" },
      take: 6,
      select: { id: true, name: true, stock: true, sku: true },
    }),
    prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { products: { _count: "desc" } },
      take: 5,
    }),
    prisma.order.findMany({ select: { total: true, createdAt: true } }),
  ]);

  // Build 12-month series
  const series = MONTHS.map((m) => ({ month: m, sales: 0, orders: 0 }));
  for (const o of orders) {
    const idx = new Date(o.createdAt).getMonth();
    series[idx].sales += Number(o.total);
    series[idx].orders += 1;
  }

  return {
    totalProducts,
    completedOrders,
    canceledOrders,
    topProductsCount: await prisma.product.count({ where: { isFeatured: true } }),
    revenue: Number(paidAgg._sum.total ?? 0),
    salesSeries: series,
    recentOrders: recent.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customer: o.user.name ?? o.user.email,
      total: Number(o.total),
      status: o.status,
      createdAt: o.createdAt,
    })),
    lowStock: lowStockRows,
    topCategories: topCats.map((c) => ({ name: c.name, count: c._count.products })),
  };
}

export async function getAdminProducts(q?: string) {
  return prisma.product.findMany({
    where: q ? { name: { contains: q, mode: "insensitive" } } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { name: true } },
      images: { take: 1, orderBy: { position: "asc" } },
      _count: { select: { variants: true } },
    },
  });
}

export async function getAdminOrders(status?: OrderStatus) {
  return prisma.order.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true } }, items: true },
  });
}

export async function getAdminOrderById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      items: { include: { product: { select: { slug: true } } } },
    },
  });
}

export async function getAdminCustomers() {
  return prisma.user.findMany({
    where: { role: "CUSTOMER" },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });
}

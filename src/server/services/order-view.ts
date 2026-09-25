import type { OrderStatus } from "@prisma/client";
import { getAdminOrderById } from "@/server/services/admin";
import { demoAdminOrderDetail } from "@/lib/demo-admin";

export type OrderAddress = {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type OrderView = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: string;
  createdAt: Date;
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  user: { name: string | null; email: string };
  shippingAddress: OrderAddress;
  items: { id: string; name: string; quantity: number; price: number; variant?: string | null; slug?: string }[];
};

export async function getOrderView(id: string): Promise<OrderView | null> {
  try {
    const o = await getAdminOrderById(id);
    if (o) {
      return {
        id: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        paymentStatus: o.paymentStatus,
        createdAt: o.createdAt,
        subtotal: Number(o.subtotal),
        shippingCost: Number(o.shippingCost),
        discount: Number(o.discount),
        total: Number(o.total),
        user: o.user,
        shippingAddress: o.shippingAddress as unknown as OrderAddress,
        items: o.items.map((it) => ({
          id: it.id,
          name: it.name,
          quantity: it.quantity,
          price: Number(it.price),
          slug: it.product?.slug,
        })),
      };
    }
  } catch {
    // DB not ready
  }
  return demoAdminOrderDetail(id) as unknown as OrderView;
}

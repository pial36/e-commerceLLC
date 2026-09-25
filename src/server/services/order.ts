import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { genOrderNumber } from "@/lib/utils";
import type { CheckoutInput } from "@/lib/validations/checkout";

// All money is integer CENTS.
const SHIPPING_FREE_OVER = 7500; // $75.00
const SHIPPING_FLAT = 999; // $9.99

export async function computeTotals(items: CheckoutInput["items"], discount = 0) {
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shippingCost = subtotal >= SHIPPING_FREE_OVER ? 0 : SHIPPING_FLAT;
  const total = Math.max(0, subtotal - discount) + shippingCost;
  return { subtotal, shippingCost, discount, total };
}

export async function resolvePromo(code?: string, subtotal = 0): Promise<number> {
  if (!code) return 0;
  const promo = await prisma.promoCode.findUnique({ where: { code } });
  if (!promo || !promo.isActive) return 0;
  if (promo.expiresAt && promo.expiresAt < new Date()) return 0;
  if (promo.maxUses && promo.usedCount >= promo.maxUses) return 0;
  if (promo.percentOff) return Math.round((subtotal * promo.percentOff) / 100);
  if (promo.amountOff) return promo.amountOff;
  return 0;
}

export async function createOrder(userId: string, input: CheckoutInput) {
  const subtotal = input.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const discount = await resolvePromo(input.promoCode, subtotal);
  const { shippingCost, total } = await computeTotals(input.items, discount);

  const order = await prisma.order.create({
    data: {
      orderNumber: genOrderNumber(),
      userId,
      subtotal,
      shippingCost,
      discount,
      total,
      promoCode: input.promoCode,
      shippingAddress: input.address as unknown as Prisma.InputJsonValue,
      items: {
        create: input.items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
      },
    },
  });

  return order;
}

export async function getUserOrders(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });
}

export async function markOrderPaid(orderId: string, paymentIntentId?: string) {
  return prisma.order.update({
    where: { id: orderId },
    data: { paymentStatus: "PAID", status: "PROCESSING", paymentIntentId },
  });
}

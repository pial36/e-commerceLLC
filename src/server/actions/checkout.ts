"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe, isStripeEnabled } from "@/lib/stripe";
import { createOrder } from "@/server/services/order";
import { checkoutSchema, type CheckoutInput } from "@/lib/validations/checkout";

export type CheckoutResult = { error?: string; redirectUrl?: string };

export async function placeOrder(input: CheckoutInput): Promise<CheckoutResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Please sign in to checkout." };

  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid data" };

  const order = await createOrder(session.user.id, parsed.data);

  // Save address to profile if new
  await prisma.address.create({
    data: { userId: session.user.id, ...parsed.data.address },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (isStripeEnabled && stripe) {
    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: parsed.data.items.map((i) => ({
        quantity: i.quantity,
        price_data: {
          currency: "usd",
          unit_amount: i.price, // already integer cents
          product_data: { name: i.name },
        },
      })),
      metadata: { orderId: order.id },
      success_url: `${appUrl}/account/orders?success=1`,
      cancel_url: `${appUrl}/checkout?canceled=1`,
    });
    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: checkout.id },
    });
    return { redirectUrl: checkout.url ?? undefined };
  }

  // Demo flow: no Stripe keys → mark order as placed, go to orders
  return { redirectUrl: `/account/orders?placed=${order.orderNumber}` };
}

export async function placeOrderAndRedirect(input: CheckoutInput) {
  const res = await placeOrder(input);
  if (res.error) throw new Error(res.error);
  if (res.redirectUrl) redirect(res.redirectUrl);
}

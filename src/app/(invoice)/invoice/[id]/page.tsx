import { ChefHat } from "lucide-react";
import { getOrderView } from "@/server/services/order-view";
import { formatPrice } from "@/lib/utils";
import { PrintButton } from "@/components/admin/print-button";

export const metadata = { title: "Invoice" };

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrderView(id);
  if (!order) return <p className="p-10">Order not found.</p>;
  const a = order.shippingAddress;

  return (
    <div className="mx-auto max-w-3xl p-8 print:p-0">
      <div className="mb-6 flex justify-end print:hidden">
        <PrintButton />
      </div>

      <div className="rounded-xl border border-border/60 bg-white p-10 text-neutral-900 shadow-sm print:border-0 print:shadow-none">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-xl font-bold">
              <ChefHat className="h-6 w-6" /> Masud Rana LLC
            </div>
            <p className="mt-1 text-sm text-neutral-500">
              30 N Gould St Ste R, Sheridan, WY 82801
              <br />
              Contact@masudrana.net · +1 (804) 485-4880
            </p>
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-bold uppercase tracking-wide">Invoice</h1>
            <p className="mt-1 text-sm text-neutral-500">{order.orderNumber}</p>
            <p className="text-sm text-neutral-500">
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
            <p className="mt-1 text-sm font-medium">
              {order.paymentStatus === "PAID" ? "PAID" : "PAYMENT DUE"}
            </p>
          </div>
        </div>

        {/* Bill to */}
        <div className="mt-8 grid grid-cols-2 gap-8 text-sm">
          <div>
            <p className="mb-1 font-semibold uppercase text-neutral-400">Bill To</p>
            <p className="font-medium">{a.fullName}</p>
            <p className="text-neutral-600">
              {a.line1}
              {a.line2 ? `, ${a.line2}` : ""}
              <br />
              {a.city}, {a.state} {a.postalCode}
              <br />
              {a.country}
              <br />
              {a.phone}
            </p>
          </div>
          <div className="text-right">
            <p className="mb-1 font-semibold uppercase text-neutral-400">Status</p>
            <p className="capitalize">{order.status.toLowerCase()}</p>
          </div>
        </div>

        {/* Items */}
        <table className="mt-8 w-full text-sm">
          <thead>
            <tr className="border-b-2 border-neutral-200 text-left text-neutral-400">
              <th className="py-2 font-semibold uppercase">Item</th>
              <th className="py-2 text-right font-semibold uppercase">Price</th>
              <th className="py-2 text-right font-semibold uppercase">Qty</th>
              <th className="py-2 text-right font-semibold uppercase">Amount</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((it) => (
              <tr key={it.id} className="border-b border-neutral-100">
                <td className="py-3">
                  {it.name}
                  {it.variant && <span className="text-neutral-500"> · {it.variant}</span>}
                </td>
                <td className="py-3 text-right">{formatPrice(it.price)}</td>
                <td className="py-3 text-right">{it.quantity}</td>
                <td className="py-3 text-right">{formatPrice(it.price * it.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="mt-6 flex justify-end">
          <div className="w-64 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Shipping</span>
              <span>{order.shippingCost === 0 ? "Free" : formatPrice(order.shippingCost)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between">
                <span className="text-neutral-500">Discount</span>
                <span>- {formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t-2 border-neutral-200 pt-2 text-base font-bold">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        <p className="mt-10 border-t border-neutral-100 pt-4 text-center text-xs text-neutral-400">
          Thank you for your order. — Masud Rana LLC
        </p>
      </div>
    </div>
  );
}

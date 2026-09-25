import Link from "next/link";
import { ArrowLeft, Printer, User, MapPin } from "lucide-react";
import { getOrderView } from "@/server/services/order-view";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/admin/status-badge";
import { OrderStatusSelect } from "@/components/admin/order-status-select";

export const metadata = { title: "Order Detail" };

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrderView(id);
  if (!order) return <p className="text-muted-foreground">Order not found.</p>;

  const a = order.shippingAddress;

  return (
    <div className="space-y-6">
      <Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl font-bold">{order.orderNumber}</h1>
          <StatusBadge status={order.status} />
        </div>
        <div className="flex items-center gap-3">
          <OrderStatusSelect orderId={order.id} current={order.status} />
          <Button asChild variant="outline">
            <Link href={`/invoice/${order.id}`} target="_blank">
              <Printer className="h-4 w-4" /> Print invoice
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((it) => (
                  <TableRow key={it.id}>
                    <TableCell className="font-medium">
                      {it.name}
                      {it.variant && <span className="text-muted-foreground"> · {it.variant}</span>}
                    </TableCell>
                    <TableCell>{formatPrice(it.price)}</TableCell>
                    <TableCell>{it.quantity}</TableCell>
                    <TableCell className="text-right">{formatPrice(it.price * it.quantity)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="space-y-2 p-5 text-sm">
              <Row label="Subtotal" value={formatPrice(order.subtotal)} />
              <Row label="Shipping" value={order.shippingCost === 0 ? "Free" : formatPrice(order.shippingCost)} />
              {order.discount > 0 && <Row label="Discount" value={`- ${formatPrice(order.discount)}`} />}
              <Separator className="my-2" />
              <Row label="Total" value={formatPrice(order.total)} bold />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4" /> Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p className="font-medium">{order.user.name ?? "—"}</p>
              <p className="text-muted-foreground">{order.user.email}</p>
              <p className="mt-2 text-muted-foreground">
                Payment: <span className="font-medium text-foreground">{order.paymentStatus}</span>
              </p>
              <p className="text-muted-foreground">
                Placed: {new Date(order.createdAt).toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4" /> Shipping address
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{a.fullName}</p>
              <p>{a.line1}{a.line2 ? `, ${a.line2}` : ""}</p>
              <p>{a.city}, {a.state} {a.postalCode}</p>
              <p>{a.country}</p>
              <p className="mt-1">{a.phone}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "text-base font-semibold" : ""}`}>
      <span className={bold ? "" : "text-muted-foreground"}>{label}</span>
      <span>{value}</span>
    </div>
  );
}

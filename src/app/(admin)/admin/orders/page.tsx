import Link from "next/link";
import type { OrderStatus } from "@prisma/client";
import { getAdminOrders } from "@/server/services/admin";
import { demoAdminOrders } from "@/lib/demo-admin";
import { formatPrice, cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
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

export const metadata = { title: "Orders" };

const FILTERS: (OrderStatus | "ALL")[] = ["ALL", "PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

type OrderRow = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  createdAt: Date;
  user: { name: string | null; email: string };
  items: { id: string }[];
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filter = (status as OrderStatus) || undefined;

  let orders: OrderRow[];
  try {
    const live = await getAdminOrders(filter);
    orders =
      live.length > 0
        ? live.map((o) => ({
            id: o.id,
            orderNumber: o.orderNumber,
            status: o.status,
            total: Number(o.total),
            createdAt: o.createdAt,
            user: o.user,
            items: o.items,
          }))
        : (demoAdminOrders(filter) as unknown as OrderRow[]);
  } catch {
    orders = demoAdminOrders(filter) as unknown as OrderRow[];
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Orders</h1>
        <p className="text-sm text-muted-foreground">{orders.length} orders</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = (f === "ALL" && !status) || status === f;
          return (
            <Link
              key={f}
              href={f === "ALL" ? "/admin/orders" : `/admin/orders?status=${f}`}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              {f.charAt(0) + f.slice(1).toLowerCase()}
            </Link>
          );
        })}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Update</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">
                    <Link href={`/admin/orders/${o.id}`} className="hover:underline">
                      {o.orderNumber}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <p>{o.user.name ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">{o.user.email}</p>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{o.items.length}</TableCell>
                  <TableCell>{formatPrice(o.total)}</TableCell>
                  <TableCell>
                    <StatusBadge status={o.status} />
                  </TableCell>
                  <TableCell>
                    <OrderStatusSelect orderId={o.id} current={o.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

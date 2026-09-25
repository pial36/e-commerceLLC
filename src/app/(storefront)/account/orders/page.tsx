import { auth } from "@/lib/auth";
import { getUserOrders } from "@/server/services/order";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "Orders" };

const STATUS_VARIANT: Record<string, "default" | "secondary" | "success" | "warning" | "destructive"> = {
  PENDING: "warning",
  PROCESSING: "default",
  SHIPPED: "default",
  DELIVERED: "success",
  CANCELLED: "destructive",
};

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ placed?: string; success?: string }>;
}) {
  const { placed, success } = await searchParams;
  const session = await auth();

  let orders: Awaited<ReturnType<typeof getUserOrders>> = [];
  try {
    if (session?.user?.id) orders = await getUserOrders(session.user.id);
  } catch {}

  return (
    <div className="space-y-6">
      {(placed || success) && (
        <div className="rounded-lg bg-emerald-600/10 px-4 py-3 text-sm text-emerald-700">
          🎉 Order placed successfully{placed ? ` — ${placed}` : ""}. Thank you!
        </div>
      )}

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            No orders yet.
          </CardContent>
        </Card>
      ) : (
        orders.map((o) => (
          <Card key={o.id}>
            <CardContent className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{o.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(o.createdAt).toLocaleDateString()} · {o.items.length} item(s)
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={STATUS_VARIANT[o.status] ?? "secondary"}>{o.status}</Badge>
                  <span className="font-semibold">{formatPrice(Number(o.total))}</span>
                </div>
              </div>
              <div className="mt-4 space-y-1 border-t border-border/60 pt-3 text-sm text-muted-foreground">
                {o.items.map((it) => (
                  <div key={it.id} className="flex justify-between">
                    <span>
                      {it.name} × {it.quantity}
                    </span>
                    <span>{formatPrice(Number(it.price) * it.quantity)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

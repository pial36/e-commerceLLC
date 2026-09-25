import type { OrderStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

const MAP: Record<OrderStatus, { variant: "default" | "secondary" | "success" | "warning" | "destructive"; label: string }> = {
  PENDING: { variant: "warning", label: "Pending" },
  PROCESSING: { variant: "default", label: "Processing" },
  SHIPPED: { variant: "default", label: "Shipped" },
  DELIVERED: { variant: "success", label: "Delivered" },
  CANCELLED: { variant: "destructive", label: "Cancelled" },
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const s = MAP[status];
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

import Link from "next/link";
import { Package, CheckCircle2, XCircle, Star, AlertTriangle } from "lucide-react";
import { getDashboardStats, type DashboardStats } from "@/server/services/admin";
import { DEMO_STATS } from "@/lib/demo-admin";
import { formatPrice } from "@/lib/utils";
import { StatCard } from "@/components/admin/stat-card";
import { SalesChart } from "@/components/admin/sales-chart";
import { StatusBadge } from "@/components/admin/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function AdminDashboard() {
  let stats: DashboardStats = DEMO_STATS;
  try {
    const live = await getDashboardStats();
    if (live.totalProducts > 0) stats = live;
  } catch {
    // DB not ready — demo data
  }

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total products" value={stats.totalProducts} delta="2.5%" icon={Package} />
        <StatCard label="Completed orders" value={stats.completedOrders} delta="2.5%" icon={CheckCircle2} />
        <StatCard label="Canceled orders" value={stats.canceledOrders} delta="1.5%" positive={false} icon={XCircle} />
        <StatCard label="Top products" value={stats.topProductsCount} delta="2.5%" icon={Star} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Sales report */}
        <Card className="xl:col-span-2">
          <CardHeader className="flex-row items-start justify-between">
            <div>
              <CardTitle>Your sales report</CardTitle>
              <p className="mt-3 text-3xl font-bold">{formatPrice(stats.revenue)}</p>
              <p className="text-xs font-medium text-emerald-600">▲ 2.5% vs last period</p>
            </div>
          </CardHeader>
          <CardContent>
            <SalesChart data={stats.salesSeries} />
          </CardContent>
        </Card>

        {/* Low stock */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" /> Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.lowStock.length === 0 ? (
              <p className="text-sm text-muted-foreground">All products well stocked.</p>
            ) : (
              stats.lowStock.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
                  <div>
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.sku}</p>
                  </div>
                  <span className="text-sm font-bold text-destructive">{p.stock} left</span>
                </div>
              ))
            )}
            <div className="pt-2">
              <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Top Categories</p>
              {stats.topCategories.map((c) => (
                <div key={c.name} className="flex items-center justify-between py-1 text-sm">
                  <span>{c.name}</span>
                  <span className="text-muted-foreground">{c.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent transactions */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Last transactions</CardTitle>
          <Link href="/admin/orders" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            View all
          </Link>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.recentOrders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">{o.orderNumber}</TableCell>
                  <TableCell>{o.customer}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{formatPrice(o.total)}</TableCell>
                  <TableCell>
                    <StatusBadge status={o.status} />
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

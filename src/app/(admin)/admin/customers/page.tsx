import { getAdminCustomers } from "@/server/services/admin";
import { demoAdminCustomers } from "@/lib/demo-admin";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata = { title: "Customers" };

type CustomerRow = {
  id: string;
  name: string | null;
  email: string;
  createdAt: Date;
  _count: { orders: number };
};

export default async function AdminCustomersPage() {
  let customers: CustomerRow[];
  try {
    const live = await getAdminCustomers();
    customers = live.length > 0 ? (live as unknown as CustomerRow[]) : (demoAdminCustomers() as CustomerRow[]);
  } catch {
    customers = demoAdminCustomers() as CustomerRow[];
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Customers</h1>
        <p className="text-sm text-muted-foreground">{customers.length} registered</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Orders</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-sm font-semibold">
                        {(c.name ?? c.email).charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium">{c.name ?? "—"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{c.email}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{c._count.orders}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

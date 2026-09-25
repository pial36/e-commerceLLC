import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Addresses" };

export default async function AddressesPage() {
  const session = await auth();

  let addresses: Awaited<ReturnType<typeof prisma.address.findMany>> = [];
  try {
    if (session?.user?.id) {
      addresses = await prisma.address.findMany({
        where: { userId: session.user.id },
        orderBy: { isDefault: "desc" },
      });
    }
  } catch {}

  if (addresses.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center text-muted-foreground">
          No saved addresses. They&apos;re added automatically at checkout.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {addresses.map((a) => (
        <Card key={a.id}>
          <CardContent className="p-5">
            <div className="mb-2 flex items-center justify-between">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              {a.isDefault && <Badge variant="secondary">Default</Badge>}
            </div>
            <p className="font-medium">{a.fullName}</p>
            <p className="text-sm text-muted-foreground">
              {a.line1}
              {a.line2 ? `, ${a.line2}` : ""}
              <br />
              {a.city}, {a.state} {a.postalCode}
              <br />
              {a.country} · {a.phone}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

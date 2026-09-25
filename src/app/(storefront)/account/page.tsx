import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const session = await auth();
  const user = session?.user;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Row label="Name" value={user?.name ?? "—"} />
        <Row label="Email" value={user?.email ?? "—"} />
        <div className="flex items-center justify-between border-b border-border/60 py-3 last:border-0">
          <span className="text-sm text-muted-foreground">Role</span>
          <Badge variant={user?.role === "ADMIN" ? "default" : "secondary"}>
            {user?.role ?? "CUSTOMER"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 py-3 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

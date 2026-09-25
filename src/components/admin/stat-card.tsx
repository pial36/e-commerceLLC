import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  delta,
  positive = true,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  delta?: string;
  positive?: boolean;
  icon: LucideIcon;
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between p-5">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-bold">{value}</p>
          {delta && (
            <p className={cn("mt-1 text-xs font-medium", positive ? "text-emerald-600" : "text-destructive")}>
              {positive ? "▲" : "▼"} {delta}
            </p>
          )}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

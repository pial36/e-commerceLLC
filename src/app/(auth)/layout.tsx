import Link from "next/link";
import { ChefHat } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/30 p-6">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2 font-display text-2xl font-bold">
          <ChefHat className="h-7 w-7" /> Masud Rana LLC
        </Link>
        <div className="rounded-2xl border border-border/60 bg-card p-8 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}

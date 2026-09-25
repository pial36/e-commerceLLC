"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { createCategory, createBrand } from "@/server/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function AddForm({
  placeholder,
  action,
}: {
  placeholder: string;
  action: (name: string) => Promise<{ error?: string; success?: boolean }>;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError(null);
    const res = await action(name.trim());
    setLoading(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setName("");
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="space-y-2">
      <div className="flex gap-2">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={placeholder} />
        <Button type="submit" size="icon" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        </Button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </form>
  );
}

export function AddCategoryForm() {
  return <AddForm placeholder="New category name" action={(name) => createCategory(name)} />;
}

export function AddBrandForm() {
  return <AddForm placeholder="New brand name" action={(name) => createBrand(name)} />;
}

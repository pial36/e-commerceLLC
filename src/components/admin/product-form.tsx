"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { upsertProduct } from "@/server/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/admin/image-upload";

type Option = { id: string; name: string };
type VariantRow = {
  name: string;
  color?: string;
  size?: string;
  sku: string;
  price?: number | null;
  stock: number;
};
type Initial = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  discount: number | null;
  sku: string;
  stock: number;
  categoryId: string;
  brandId: string | null;
  isActive: boolean;
  isFeatured: boolean;
  images: string[];
  variants: VariantRow[];
};

export function ProductForm({
  categories,
  brands,
  initial,
}: {
  categories: Option[];
  brands: Option[];
  initial?: Initial;
}) {
  const router = useRouter();
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? categories[0]?.id ?? "");
  const [brandId, setBrandId] = useState(initial?.brandId ?? "");
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured ?? false);
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [variants, setVariants] = useState<VariantRow[]>(initial?.variants ?? []);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const addVariant = () =>
    setVariants((v) => [...v, { name: "", sku: "", stock: 0, color: "", size: "" }]);
  const updateVariant = (i: number, patch: Partial<VariantRow>) =>
    setVariants((v) => v.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  const removeVariant = (i: number) =>
    setVariants((v) => v.filter((_, idx) => idx !== i));

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await upsertProduct(initial?.id ?? null, {
      name: fd.get("name"),
      description: fd.get("description"),
      price: fd.get("price"),
      discount: fd.get("discount") || null,
      sku: fd.get("sku"),
      stock: fd.get("stock"),
      categoryId,
      brandId,
      isActive,
      isFeatured,
      images,
      variants: variants.map((v) => ({
        ...v,
        price: v.price === undefined || v.price === null || Number.isNaN(v.price) ? null : v.price,
      })),
    });
    setLoading(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    router.push("/admin/products");
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Product details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={initial?.name} required className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" defaultValue={initial?.description ?? ""} className="mt-1.5" rows={4} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price ($)</Label>
                <Input id="price" name="price" type="number" step="0.01" defaultValue={initial?.price} required className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="discount">Discount price ($)</Label>
                <Input id="discount" name="discount" type="number" step="0.01" defaultValue={initial?.discount ?? ""} className="mt-1.5" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sku">SKU</Label>
                <Input id="sku" name="sku" defaultValue={initial?.sku} required className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="stock">Base stock</Label>
                <Input id="stock" name="stock" type="number" defaultValue={initial?.stock ?? 0} required className="mt-1.5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Images</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUpload value={images} onChange={setImages} />
          </CardContent>
        </Card>

        {/* Variants */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Variants</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addVariant}>
              <Plus className="h-4 w-4" /> Add variant
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {variants.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No variants. Base stock is used when there are none.
              </p>
            )}
            {variants.map((v, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_1fr_90px_80px_auto] items-end gap-2 rounded-lg border p-3">
                <Field label="Name" value={v.name} onChange={(val) => updateVariant(i, { name: val })} placeholder="Black / 10in" />
                <Field label="Color" value={v.color ?? ""} onChange={(val) => updateVariant(i, { color: val })} />
                <Field label="SKU" value={v.sku} onChange={(val) => updateVariant(i, { sku: val })} />
                <Field label="Price" type="number" value={v.price ?? ""} onChange={(val) => updateVariant(i, { price: val === "" ? null : Number(val) })} />
                <Field label="Stock" type="number" value={v.stock} onChange={(val) => updateVariant(i, { stock: Number(val) })} />
                <Button type="button" variant="ghost" size="icon" onClick={() => removeVariant(i)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Organization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Brand</Label>
              <Select value={brandId} onValueChange={setBrandId}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4" />
              Active (visible in store)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="h-4 w-4" />
              Featured (bestseller)
            </label>
          </CardContent>
        </Card>

        {error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
        )}

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {initial ? "Save changes" : "Create product"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 h-8"
      />
    </div>
  );
}

import { z } from "zod";

export const variantSchema = z.object({
  name: z.string().min(1, "Variant name required"),
  color: z.string().optional(),
  size: z.string().optional(),
  sku: z.string().min(1, "Variant SKU required"),
  price: z.coerce.number().nonnegative().optional().nullable(),
  stock: z.coerce.number().int().nonnegative().default(0),
});

export const productSchema = z.object({
  name: z.string().min(2, "Name required"),
  description: z.string().optional(),
  price: z.coerce.number().positive("Price must be > 0"),
  discount: z.coerce.number().nonnegative().optional().nullable(),
  sku: z.string().min(2, "SKU required"),
  stock: z.coerce.number().int().nonnegative(),
  categoryId: z.string().min(1, "Category required"),
  brandId: z.string().optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  images: z.array(z.string().url()).default([]),
  variants: z.array(variantSchema).default([]),
});

export type ProductInput = z.infer<typeof productSchema>;
export type VariantInput = z.infer<typeof variantSchema>;

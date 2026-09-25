import type {
  Product,
  ProductImage,
  ProductVariant,
  ProductSpec,
  Category,
  Brand,
  Review,
} from "@prisma/client";

/** Product serialized for client (Decimal -> number) */
export type SerializedProduct = Omit<Product, "price" | "discount"> & {
  price: number;
  discount: number | null;
};

export type ProductWithRelations = SerializedProduct & {
  images: ProductImage[];
  category: Pick<Category, "id" | "name" | "slug">;
  brand: Pick<Brand, "id" | "name" | "slug"> | null;
  variants: (Omit<ProductVariant, "price"> & { price: number | null })[];
};

export type ProductDetail = ProductWithRelations & {
  specs: ProductSpec[];
  reviews: (Review & { user: { name: string | null; image: string | null } })[];
};

export type ProductFilters = {
  q?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sort?: "newest" | "price-asc" | "price-desc" | "rating" | "featured";
  page?: number;
  perPage?: number;
};

export type CartLine = {
  productId: string;
  variantId?: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  quantity: number;
  variantLabel?: string;
  maxStock: number;
};

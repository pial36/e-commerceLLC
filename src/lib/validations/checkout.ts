import { z } from "zod";

export const addressSchema = z.object({
  fullName: z.string().min(2, "Name required"),
  phone: z.string().min(6, "Phone required"),
  line1: z.string().min(3, "Address required"),
  line2: z.string().optional(),
  city: z.string().min(2, "City required"),
  state: z.string().min(2, "State required"),
  postalCode: z.string().min(3, "Postal code required"),
  country: z.string().min(2).default("USA"),
});

export const checkoutItemSchema = z.object({
  productId: z.string(),
  variantId: z.string().optional(),
  name: z.string(),
  price: z.number().nonnegative(),
  quantity: z.number().int().positive(),
});

export const checkoutSchema = z.object({
  address: addressSchema,
  items: z.array(checkoutItemSchema).min(1, "Cart is empty"),
  promoCode: z.string().optional(),
});

export type AddressInput = z.infer<typeof addressSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;

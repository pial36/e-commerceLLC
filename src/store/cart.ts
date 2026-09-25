"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine } from "@/types";

type CartState = {
  items: CartLine[];
  isOpen: boolean;
  addItem: (line: CartLine) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQty: (productId: string, variantId: string | undefined, qty: number) => void;
  clear: () => void;
  setOpen: (open: boolean) => void;
};

const sameLine = (a: CartLine, productId: string, variantId?: string) =>
  a.productId === productId && a.variantId === variantId;

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      addItem: (line) =>
        set((s) => {
          const existing = s.items.find((i) =>
            sameLine(i, line.productId, line.variantId)
          );
          if (existing) {
            return {
              items: s.items.map((i) =>
                sameLine(i, line.productId, line.variantId)
                  ? { ...i, quantity: Math.min(i.quantity + line.quantity, i.maxStock) }
                  : i
              ),
              isOpen: true,
            };
          }
          return { items: [...s.items, line], isOpen: true };
        }),
      removeItem: (productId, variantId) =>
        set((s) => ({
          items: s.items.filter((i) => !sameLine(i, productId, variantId)),
        })),
      updateQty: (productId, variantId, qty) =>
        set((s) => ({
          items: s.items.map((i) =>
            sameLine(i, productId, variantId)
              ? { ...i, quantity: Math.max(1, Math.min(qty, i.maxStock)) }
              : i
          ),
        })),
      clear: () => set({ items: [] }),
      setOpen: (isOpen) => set({ isOpen }),
    }),
    { name: "mrl-cart-v2", version: 2 }
  )
);

/** Derived selectors (call inside components) */
export const cartCount = (items: CartLine[]) =>
  items.reduce((n, i) => n + i.quantity, 0);
export const cartSubtotal = (items: CartLine[]) =>
  items.reduce((sum, i) => sum + i.price * i.quantity, 0);

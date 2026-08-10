'use client';

import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartLine } from '@/lib/types';

type TiendaState = {
  cart: CartLine[];
  wish: string[];
  cartOpen: boolean;
  add: (line: Omit<CartLine, 'qty'>) => void;
  inc: (key: string) => void;
  dec: (key: string) => void;
  remove: (key: string) => void;
  clear: () => void;
  toggleWish: (id: string) => void;
  openCart: () => void;
  closeCart: () => void;
};

export const useTienda = create<TiendaState>()(
  persist(
    (set) => ({
      cart: [],
      wish: [],
      cartOpen: false,

      add: (line) =>
        set((s) => {
          const found = s.cart.find((c) => c.key === line.key);
          return {
            cart: found
              ? s.cart.map((c) => (c.key === line.key ? { ...c, qty: c.qty + 1 } : c))
              : [...s.cart, { ...line, qty: 1 }],
            cartOpen: true,
          };
        }),

      inc: (key) =>
        set((s) => ({ cart: s.cart.map((c) => (c.key === key ? { ...c, qty: c.qty + 1 } : c)) })),

      dec: (key) =>
        set((s) => ({
          cart: s.cart.map((c) => (c.key === key ? { ...c, qty: Math.max(1, c.qty - 1) } : c)),
        })),

      remove: (key) => set((s) => ({ cart: s.cart.filter((c) => c.key !== key) })),

      clear: () => set({ cart: [] }),

      toggleWish: (id) =>
        set((s) => ({
          wish: s.wish.includes(id) ? s.wish.filter((x) => x !== id) : [...s.wish, id],
        })),

      openCart: () => set({ cartOpen: true }),
      closeCart: () => set({ cartOpen: false }),
    }),
    {
      name: 'broka.tienda',
      partialize: (s) => ({ cart: s.cart, wish: s.wish }),
    },
  ),
);

/**
 * El carrito vive en localStorage, así que en el primer render del servidor
 * está vacío. Los contadores se leen con este hook para no romper la
 * hidratación mostrando un número que el servidor no pintó.
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    // Sin localStorage (SSR, o navegador con almacenamiento bloqueado) zustand
    // no monta la API de persistencia: ahí no hay nada que esperar.
    const p = useTienda.persist;
    if (!p) {
      setHydrated(true);
      return;
    }
    if (p.hasHydrated()) setHydrated(true);
    return p.onFinishHydration(() => setHydrated(true));
  }, []);
  return hydrated;
}

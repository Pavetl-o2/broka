import raw from '@/data/products.json';
import type { Categoria, Dims, FinishKey, Producto } from '@/lib/types';

export const PRODUCTS = raw as Producto[];

export const CATEGORIAS: Categoria[] = ['Sillas', 'Mesas', 'Libreros', 'Bancos'];

export function getProduct(id: string): Producto | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

/** Índice del producto en el catálogo, formateado "01".."NN". */
export function numeroDe(id: string): string {
  return String(PRODUCTS.findIndex((p) => p.id === id) + 1).padStart(2, '0');
}

export function finishOf(p: Producto, finish: FinishKey | null): FinishKey {
  return finish && p.finishes.includes(finish) ? finish : p.finishes[0];
}

export function dimsOf(p: Producto): Dims {
  return p.medida;
}

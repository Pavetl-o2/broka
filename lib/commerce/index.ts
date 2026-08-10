import * as local from '@/lib/commerce/local';
import type { CartLine, Producto } from '@/lib/types';

export type Filtros = {
  categoria?: string;
  material?: string;
  precio?: string;
  orden?: string;
};

export type DatosPedido = {
  email: string;
  telefono: string;
  nombre: string;
  apellidos: string;
  calle: string;
  colonia: string;
  cp: string;
  ciudad: string;
  estado: string;
};

export type Cotizacion = {
  nombre: string;
  email: string;
  mensaje?: string;
  producto: string;
  acabado: string;
  medidas: string;
  estimado: number;
};

/**
 * Toda la UI habla con esta interfaz y nunca con el motor de comercio.
 * Cambiar de motor (Medusa, Shopify) es escribir otra implementación aquí
 * y cambiar la línea de abajo: la UI no se toca.
 */
export interface CommerceService {
  listProducts(filtros?: Filtros): Promise<Producto[]>;
  getProduct(id: string): Promise<Producto | undefined>;
  /** El precio se calcula en el servidor a partir de las medidas, nunca se confía al cliente. */
  quoteLines(lines: CartLine[]): Promise<{ lines: CartLine[]; subtotal: number; iva: number; envio: number; total: number }>;
  createCheckoutSession(
    lines: CartLine[],
    origin: string,
    datos: DatosPedido,
  ): Promise<{ url: string | null }>;
  requestQuote(payload: Cotizacion): Promise<void>;
}

export const commerce: CommerceService = local;

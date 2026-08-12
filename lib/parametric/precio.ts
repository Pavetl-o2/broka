import { armados } from '@/lib/parametric/armados';
import { faceDims } from '@/lib/parametric/geometria';
import type { CostBreakdown, FinishKey, Producto } from '@/lib/types';

/**
 * Tarifas del taller — réplica de la lógica de `mueble-calc`:
 * hojas + tiempo de máquina + herraje y acabado, sumados.
 *
 * ⚠ Los números salen de la descripción del cliente, no del repo `mueble-calc`.
 * Cotéjalos antes de producción: es el punto de mayor riesgo del proyecto.
 */
export const TARIFA = {
  /** MXN por hoja de 2440 × 1220 × 18. */
  hoja: { abedul: 1850, mdf: 980 },
  /** MXN por metro lineal de trayectoria de ruteo. */
  ruteo: 18,
  /** MXN por m² de superficie sellada. */
  acabado: 220,
  margen: 1.9,
  /** Aprovechamiento del anidado. */
  nesting: 0.82,
} as const;

/** Hoja estándar en metros. */
export const HOJA = { largo: 2.44, ancho: 1.22 } as const;

export const IVA = 0.16;

/** Envío nacional incluido a partir de este subtotal (MXN, sin IVA). */
export const ENVIO_GRATIS_DESDE = 10000;

/** Costo de envío cuando el pedido no alcanza el mínimo. */
export const ENVIO = 890;

/**
 * Acabados. `c` es el color de la CARA; el canto va aparte.
 *
 * El canto queda siempre a la vista con el corazón del triplay, que es lo que
 * distingue una pieza cortada de una laminada: en el natural apenas se nota, y
 * en los cubrientes es la línea que delata el material.
 */
export const CANTO = '#B98F5E';

export const FIN: Record<FinishKey, { n: string; c: string; mult: number }> = {
  abedul: { n: 'Abedul natural', c: '#DCC9A6', mult: 1.0 },
  blanco: { n: 'Blanco mate', c: '#EDE9E1', mult: 1.06 },
  negro: { n: 'Negro mate', c: '#2E2E2C', mult: 1.09 },
  azul: { n: 'Azul', c: '#2F4B6B', mult: 1.09 },
};

/**
 * Precio del mueble con un acabado. No toma medidas: cada mueble tiene una
 * sola, la de su DXF, y el despiece sale de ahí.
 */
export function cost(prod: Producto, finishKey: FinishKey): CostBreakdown {
  const parts = armados(prod.type);
  let area = 0;
  let perim = 0;
  for (const p of parts) {
    // La cara de la pieza son sus dos lados mayores; el menor es el espesor.
    const [a, b] = faceDims(p);
    area += (a * b) / 1e6;
    perim += (2 * (a + b)) / 1000;
  }

  const hojas = area / (HOJA.largo * HOJA.ancho * TARIFA.nesting);
  const cHojas = hojas * TARIFA.hoja[prod.panel];
  const cRuteo = perim * TARIFA.ruteo;
  const cAcab = area * 2 * TARIFA.acabado * (FIN[finishKey]?.mult ?? 1);
  const bruto = (cHojas + cRuteo + cAcab + prod.herraje) * TARIFA.margen;

  return {
    total: Math.round(bruto / 50) * 50,
    hojas,
    area,
    perim,
    cHojas,
    cRuteo,
    cAcab,
    herraje: prod.herraje,
    piezas: parts.length,
  };
}

/** Precio con el primer acabado: el que se muestra en el catálogo. */
export function precioDe(p: Producto): number {
  return cost(p, p.finishes[0]).total;
}

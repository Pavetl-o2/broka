import type { Dims } from '@/lib/types';

const mxn = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 0,
});

export function money(n: number): string {
  return mxn.format(n);
}

/** "L 160 × F 90 × A 75 cm" — el prototipo muestra siempre centímetros. */
export function sizeLabel(d: Dims): string {
  return `L ${Math.round(d.w / 10)} × F ${Math.round(d.d / 10)} × A ${Math.round(d.h / 10)} cm`;
}

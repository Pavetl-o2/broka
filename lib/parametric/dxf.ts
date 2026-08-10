import { partList } from '@/lib/parametric/partList';
import type { Dims, MuebleType, Part } from '@/lib/types';

/** Hoja de tablero en mm. */
const HOJA_W = 2440;
const HOJA_H = 1220;
/** Separación entre piezas: diámetro de fresa + margen de sujeción. */
const KERF = 12;
const MARGEN = 15;

type Colocada = { part: Part; hoja: number; x: number; y: number; girada: boolean };

/**
 * Anidado por estantes: ordena las piezas de mayor a menor alto y las va
 * acostando en filas. No es óptimo — el aprovechamiento real hay que medirlo
 * en taller — pero es determinista y suficiente para emitir el despiece.
 */
export function anidar(parts: Part[]): Colocada[] {
  const orden = parts
    .map((part, i) => ({ part, i }))
    .sort((a, b) => Math.max(b.part.w, b.part.h) - Math.max(a.part.w, a.part.h));

  const out: Colocada[] = [];
  let hoja = 0;
  let cursorX = MARGEN;
  let cursorY = MARGEN;
  let altoFila = 0;

  for (const { part } of orden) {
    // Acuesta la pieza si así cabe a lo ancho de la hoja.
    const girada = part.w < part.h && part.h <= HOJA_W - 2 * MARGEN;
    const w = girada ? part.h : part.w;
    const h = girada ? part.w : part.h;

    if (cursorX + w > HOJA_W - MARGEN) {
      cursorX = MARGEN;
      cursorY += altoFila + KERF;
      altoFila = 0;
    }
    if (cursorY + h > HOJA_H - MARGEN) {
      hoja += 1;
      cursorX = MARGEN;
      cursorY = MARGEN;
      altoFila = 0;
    }

    out.push({ part, hoja, x: cursorX, y: cursorY, girada });
    cursorX += w + KERF;
    altoFila = Math.max(altoFila, h);
  }

  return out;
}

function line(x1: number, y1: number, x2: number, y2: number, capa: string): string {
  return [
    '0',
    'LINE',
    '8',
    capa,
    '10',
    x1.toFixed(3),
    '20',
    y1.toFixed(3),
    '30',
    '0.0',
    '11',
    x2.toFixed(3),
    '21',
    y2.toFixed(3),
    '31',
    '0.0',
  ].join('\n');
}

function rect(x: number, y: number, w: number, h: number, capa: string): string {
  return [
    line(x, y, x + w, y, capa),
    line(x + w, y, x + w, y + h, capa),
    line(x + w, y + h, x, y + h, capa),
    line(x, y + h, x, y, capa),
  ].join('\n');
}

function texto(x: number, y: number, s: string): string {
  return ['0', 'TEXT', '8', 'TEXTO', '10', x.toFixed(3), '20', y.toFixed(3), '30', '0.0', '40', '18', '1', s].join(
    '\n',
  );
}

/**
 * Despiece en DXF R12 (entidades LINE, compatible con cualquier CAM).
 * Interno: se genera al confirmar el pedido y va directo a producción.
 * El cliente nunca lo ve.
 *
 * Las hojas se emiten una junto a otra en X, separadas, para poder revisarlas
 * en un solo archivo.
 */
export function despieceDXF(type: MuebleType, dims: Dims, etiqueta: string): string {
  const parts = partList(type, dims.w, dims.d, dims.h);
  const colocadas = anidar(parts);

  const cuerpo: string[] = [];
  const hojas = Math.max(...colocadas.map((c) => c.hoja)) + 1;

  for (let h = 0; h < hojas; h++) {
    const offsetX = h * (HOJA_W + 200);
    cuerpo.push(rect(offsetX, 0, HOJA_W, HOJA_H, 'HOJA'));
    cuerpo.push(texto(offsetX, HOJA_H + 40, `${etiqueta} · hoja ${h + 1} de ${hojas}`));
  }

  for (const c of colocadas) {
    const offsetX = c.hoja * (HOJA_W + 200);
    const w = c.girada ? c.part.h : c.part.w;
    const h = c.girada ? c.part.w : c.part.h;
    cuerpo.push(rect(offsetX + c.x, c.y, w, h, 'CORTE'));
    cuerpo.push(texto(offsetX + c.x + 8, c.y + 8, c.part.nombre));

    if (c.part.routed && c.part.hole) {
      const hw = c.girada ? c.part.hole.h : c.part.hole.w;
      const hh = c.girada ? c.part.hole.w : c.part.hole.h;
      // hole.y viene medido desde el centro de la pieza.
      const cx = offsetX + c.x + w / 2;
      const cy = c.y + h / 2 + (c.girada ? 0 : c.part.hole.y);
      const cxg = c.girada ? cx + c.part.hole.y : cx;
      cuerpo.push(rect(cxg - hw / 2, cy - hh / 2, hw, hh, 'INTERIOR'));
    }
  }

  return [
    '0',
    'SECTION',
    '2',
    'ENTITIES',
    cuerpo.join('\n'),
    '0',
    'ENDSEC',
    '0',
    'EOF',
    '',
  ].join('\n');
}

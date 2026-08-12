import { armados } from '@/lib/parametric/armados';
import { faceDims } from '@/lib/parametric/geometria';
import type { MuebleType, Part, Punto2 } from '@/lib/types';

/** Hoja de tablero en mm. */
const HOJA_W = 2440;
const HOJA_H = 1220;
/** Separación entre piezas: diámetro de fresa + margen de sujeción. */
const KERF = 12;
const MARGEN = 15;

type Colocada = { part: Part; hoja: number; x: number; y: number; girada: boolean };

/** Cara de la pieza tal como se corta: los dos lados mayores. */
function cara(p: Part): [number, number] {
  return faceDims(p);
}

/**
 * Anidado por estantes: ordena las piezas de mayor a menor alto y las va
 * acostando en filas. No es óptimo — el aprovechamiento real hay que medirlo
 * en taller — pero es determinista y suficiente para emitir el despiece.
 */
export function anidar(parts: Part[]): Colocada[] {
  const orden = parts
    .map((part, i) => ({ part, i }))
    .sort((a, b) => Math.max(...cara(b.part)) - Math.max(...cara(a.part)));

  const out: Colocada[] = [];
  let hoja = 0;
  let cursorX = MARGEN;
  let cursorY = MARGEN;
  let altoFila = 0;

  for (const { part } of orden) {
    const [pw, ph] = cara(part);
    // Acuesta la pieza si así cabe a lo ancho de la hoja.
    const girada = pw < ph && ph <= HOJA_W - 2 * MARGEN;
    const w = girada ? ph : pw;
    const h = girada ? pw : ph;

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

/** Contorno cerrado, ya colocado en la hoja. */
function poly(pts: Punto2[], ox: number, oy: number, girada: boolean, alto: number, capa: string): string {
  const map = (p: Punto2): [number, number] =>
    // Al acostar la pieza, la cara gira 90°: (u, v) → (v, alto − u).
    girada ? [ox + p[1], oy + alto - p[0]] : [ox + p[0], oy + p[1]];
  const out: string[] = [];
  for (let i = 0; i < pts.length; i++) {
    const a = map(pts[i]);
    const b = map(pts[(i + 1) % pts.length]);
    out.push(line(a[0], a[1], b[0], b[1], capa));
  }
  return out.join('\n');
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
export function despieceDXF(type: MuebleType, etiqueta: string): string {
  const parts = armados(type);
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
    const [pw, ph] = cara(c.part);
    const w = c.girada ? ph : pw;
    const h = c.girada ? pw : ph;
    const ox = offsetX + c.x;

    if (c.part.perfil) {
      cuerpo.push(poly(c.part.perfil, ox, c.y, c.girada, ph, 'CORTE'));
    } else {
      cuerpo.push(rect(ox, c.y, w, h, 'CORTE'));
    }
    cuerpo.push(texto(ox + 8, c.y + 8, c.part.nombre));

    for (const hueco of c.part.huecos ?? []) {
      cuerpo.push(poly(hueco, ox, c.y, c.girada, ph, 'INTERIOR'));
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

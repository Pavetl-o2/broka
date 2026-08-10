import ARMADO from '@/lib/parametric/armado-cnc.json';
import { armarCuerpo, type Celda } from '@/lib/parametric/cuerpo';
import type { MuebleType, Part, Punto2 } from '@/lib/types';

/** Espesor de tablero en mm. Toda la geometría depende de él. */
export const ESPESOR = 18;

/** El librero se corta en 12: así vienen sus DXF (capa `..._12.000MM`). */
export const ESPESOR_LIBRERO = 12;

export function espesorDe(type: MuebleType): number {
  return type === 'librero' ? ESPESOR_LIBRERO : ESPESOR;
}

/**
 * Muebles que se arman solos desde su DXF.
 *
 * El armado no se escribe aquí: lo resuelve el solver de juntas de
 * `mueble-calc`, que empareja espigas con mortajas y saca de ahí dónde va cada
 * pieza — incluida cuántas copias lleva, que es como el costado de la silla
 * aparece dos veces aunque el DXF lo dibuje una. `armado-cnc.json` es su
 * salida, ya en coordenadas de taller.
 *
 * Aquí solo se escala a la medida que pida el producto. A la talla del plano
 * el factor es 1 y el mueble sale idéntico al archivo de corte.
 */
const DEL_PLANO: Partial<Record<MuebleType, keyof typeof ARMADO>> = {
  silla: 'silla',
  mesa: 'mesa',
  banco: 'banco',
};

function armadoResuelto(clave: keyof typeof ARMADO, W: number, D: number, H: number): Part[] {
  const a = ARMADO[clave];
  const [ew, ed, eh] = a.envolvente;
  const k: [number, number, number] = [W / ew, D / ed, H / eh];
  const esc = (p: number[]): [number, number, number] => [p[0] * k[0], p[1] * k[1], p[2] * k[2]];

  return a.instancias.map((inst) => {
    const pieza = a.piezas[inst.pieza];
    const t = pieza.espesor || a.espesor;
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const [x, y] of pieza.contorno as [number, number][]) {
      x0 = Math.min(x0, x); x1 = Math.max(x1, x);
      y0 = Math.min(y0, y); y1 = Math.max(y1, y);
    }
    return {
      nombre: pieza.nombre,
      grupo: pieza.nombre,
      // El tablero plano: es lo que miran el costo y el anidado.
      sx: x1 - x0,
      sy: y1 - y0,
      sz: t,
      px: 0,
      py: 0,
      pz: 0,
      perfil: pieza.contorno as Punto2[],
      huecos: pieza.huecos as Punto2[][],
      // Escalar la base junto con el origen estira el mueble entero como una
      // sola figura, en vez de mover las piezas y dejarlas del tamaño viejo.
      pose: { o: esc(inst.o), u: esc(inst.u), v: esc(inst.v), w: esc(inst.w) },
    } satisfies Part;
  });
}

// ---------------------------------------------------------------

/**
 * Despiece paramétrico. Es la única fuente de verdad del sistema:
 *
 *   armados(type, W, D, H)
 *      ├── geometría 3D  → una caja por pieza, en px/py/pz
 *      ├── costo         → área de tablero, metros de ruteo, m² de acabado
 *      └── despiece DXF  → los mismos rectángulos, anidados en hoja
 *
 * Por eso el visor y el precio no pueden contradecirse.
 *
 * Convención de `mueble-calc`, en mm: X ancho, Y profundidad, Z alto, Z hacia
 * arriba, px/py/pz esquina mínima, y = 0 al frente del mueble.
 */
export function armados(type: MuebleType, W: number, D: number, H: number): Part[] {
  const t = espesorDe(type);
  const P: Part[] = [];

  const caja = (
    nombre: string,
    grupo: string,
    sx: number,
    sy: number,
    sz: number,
    px: number,
    py: number,
    pz: number,
    perfil?: Punto2[],
    huecos?: Punto2[][],
  ) => P.push({ nombre, grupo, sx, sy, sz, px, py, pz, perfil, huecos });

  const delPlano = DEL_PLANO[type];
  if (delPlano) return armadoResuelto(delPlano, W, D, H);

  if (type === 'librero') {
    // Retícula: tres verticales de piso a techo y entrepaños que vuelan por
    // fuera. Se arma con el reparto de columnas y celdas, no a mano.
    const n = Math.max(3, Math.round(H / 365));
    const paso = (H - t) / n;
    const celdas: Celda[] = Array.from({ length: n - 1 }, () => ({ altoRel: 1, repisas: 0 }));
    P.push(
      ...armarCuerpo({
        ancho: W,
        prof: D,
        alto: H,
        esp: t,
        vuelo: paso / 2,
        voladizo: W * 0.0674,
        columnas: [
          { anchoRel: 1, celdas },
          { anchoRel: 1, celdas },
        ],
      }),
    );
  } else if (type === 'escritorio') {
    caja('Cubierta', 'Cubierta', W, D, t, 0, 0, H - t);
    caja('Costado', 'Costado', t, D - 40, H - t, 0, 20, 0, undefined, [
      [[110, 0], [110 + (D - 260), 0], [110 + (D - 260), (H - t) * 0.34], [110, (H - t) * 0.34]],
    ]);
    caja('Costado', 'Costado', t, D - 40, H - t, W - t, 20, 0, undefined, [
      [[110, 0], [110 + (D - 260), 0], [110 + (D - 260), (H - t) * 0.34], [110, (H - t) * 0.34]],
    ]);
    caja('Faldón', 'Faldón', W - 2 * t, t, 190, t, D - t - 40, H - t - 225);
    caja('Repisa', 'Repisa', 460, D - 90, t, 30, 45, H - 300 - t / 2);
  } else {
    caja('Costado', 'Costado', t, D, H, 0, 0, 0);
    caja('Costado', 'Costado', t, D, H, W - t, 0, 0);
    caja('Base', 'Base', W - 2 * t, D, t, t, 0, 0);
    caja('Tapa', 'Tapa', W - 2 * t, D, t, t, 0, H - t);
    caja('Entrepaño', 'Entrepaño', W - 2 * t, D - 20, t, t, 2, H * 0.46 - t / 2);
    caja('Trasera', 'Trasera', W - 2 * t, t, H - 2 * t, t, D - t, t);
    const fh = H * 0.28;
    const jal = (W - 2 * t) * 0.34;
    caja('Frente de cajón', 'Frente de cajón', W - 2 * t - 8, t, fh, t + 4, 0, H - t - H * 0.31,
      undefined, [[
        [(W - 2 * t - 8 - jal) / 2, fh - 47],
        [(W - 2 * t - 8 + jal) / 2, fh - 47],
        [(W - 2 * t - 8 + jal) / 2, fh - 21],
        [(W - 2 * t - 8 - jal) / 2, fh - 21],
      ]]);
  }

  return P;
}

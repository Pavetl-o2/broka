import ARMADO from '@/lib/parametric/armado-cnc.json';
import { armarCuerpo, type Celda } from '@/lib/parametric/cuerpo';
import type { Dims, MuebleType, Part, Punto2 } from '@/lib/types';

/** Espesor de tablero en mm. Sale del DXF de cada mueble, no de un supuesto. */
export const ESPESOR: Record<MuebleType, number> = {
  silla: ARMADO.silla.espesor,
  mesa: ARMADO.mesa.espesor,
  banco: ARMADO.banco.espesor,
  // El librero se corta en 12: así lo declaran sus capas (`..._12.000MM`).
  librero: 12,
};

/** Medida del mueble armado, en mm. Es la del DXF y no se negocia. */
export const MEDIDA: Record<MuebleType, Dims> = {
  silla: envolvente('silla'),
  mesa: envolvente('mesa'),
  banco: envolvente('banco'),
  librero: { w: 1100, d: 380, h: 1825 },
};

function envolvente(clave: keyof typeof ARMADO): Dims {
  const [w, d, h] = ARMADO[clave].envolvente;
  return { w, d, h };
}

/**
 * Muebles que se arman solos desde su DXF.
 *
 * El armado no se escribe aquí: lo resuelve el solver de juntas de
 * `mueble-calc`, que empareja espigas con mortajas y saca de ahí dónde va cada
 * pieza — incluida cuántas copias lleva, que es como el costado de la silla
 * aparece dos veces aunque el DXF lo dibuje una. `armado-cnc.json` es su
 * salida, ya en coordenadas de taller, y se usa tal cual.
 *
 * No hay escalado. Antes se estiraba el armado a la medida que pidiera el
 * usuario, y eso multiplicaba también el ESPESOR del tablero: una mesa un 50 %
 * más ancha salía con patas de 45 mm, que no es un tablero que exista. Cada
 * medida distinta necesita su propio DXF cortado y probado.
 */
const DEL_PLANO: Partial<Record<MuebleType, keyof typeof ARMADO>> = {
  silla: 'silla',
  mesa: 'mesa',
  banco: 'banco',
};

function armadoResuelto(clave: keyof typeof ARMADO): Part[] {
  const a = ARMADO[clave];

  return a.instancias.map((inst) => {
    const pieza = a.piezas[inst.pieza];
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
      sz: pieza.espesor || a.espesor,
      px: 0,
      py: 0,
      pz: 0,
      perfil: pieza.contorno as Punto2[],
      huecos: pieza.huecos as Punto2[][],
      pose: {
        o: inst.o as [number, number, number],
        u: inst.u as [number, number, number],
        v: inst.v as [number, number, number],
        w: inst.w as [number, number, number],
      },
    } satisfies Part;
  });
}

// ---------------------------------------------------------------

/**
 * Despiece del mueble. Es la única fuente de verdad del sistema:
 *
 *   armados(type)
 *      ├── geometría 3D  → una pieza por tablero, colocada por su pose
 *      ├── costo         → área de tablero, metros de ruteo, m² de acabado
 *      └── despiece DXF  → los mismos contornos, anidados en hoja
 *
 * Por eso el visor y el precio no pueden contradecirse.
 *
 * Convención de `mueble-calc`, en mm: X ancho, Y profundidad, Z alto, Z hacia
 * arriba, px/py/pz esquina mínima, y = 0 al frente del mueble.
 *
 * Para sumar un mueble: se corre `scripts/armado-cnc.ts` con su DXF, se agrega
 * su clave a `MuebleType` y su entrada a `data/products.json`. Si el armado
 * sale del solver basta con listarlo en `DEL_PLANO`.
 */
export function armados(type: MuebleType): Part[] {
  const delPlano = DEL_PLANO[type];
  if (delPlano) return armadoResuelto(delPlano);

  // Retícula: tres verticales de piso a techo y entrepaños que vuelan por
  // fuera. Se arma con el reparto de columnas y celdas, no a mano. Es el único
  // que no pasa por el solver: su DXF es el caso de fallo conocido -lo cruza
  // como rejilla- y faltan hojas del juego para resolverlo.
  const { w: W, d: D, h: H } = MEDIDA.librero;
  const t = ESPESOR.librero;
  const n = Math.max(3, Math.round(H / 365));
  const paso = (H - t) / n;
  const celdas: Celda[] = Array.from({ length: n - 1 }, () => ({ altoRel: 1, repisas: 0 }));

  return armarCuerpo({
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
  });
}

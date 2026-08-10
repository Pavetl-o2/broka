import type { Part } from '@/lib/types';

/**
 * CONSTRUCTOR DE CUERPO — puerto del `buildFurniture` de `mueble-calc`.
 *
 * El cuerpo es una rejilla: se reparte a lo ancho en columnas y cada columna se
 * reparte a lo alto en celdas. Los divisores salen del reparto, no de una lista
 * escrita a mano, así que cambiar el número de entrepaños no obliga a tocar
 * ninguna coordenada.
 *
 * Misma convención que el resto: X ancho, Y profundidad, Z alto, Z arriba,
 * px/py/pz esquina mínima, y = 0 al frente.
 */

export type Celda = {
  /** Proporción de alto dentro de la columna. */
  altoRel: number;
  /** Repisas sueltas dentro de la celda. */
  repisas: number;
};

export type Columna = {
  /** Proporción de ancho dentro del cuerpo. */
  anchoRel: number;
  celdas: Celda[];
};

export type CuerpoSpec = {
  ancho: number;
  prof: number;
  alto: number;
  esp: number;
  /**
   * Cuánto sobresalen los verticales por arriba y por abajo del cuerpo. En el
   * librero son los pies y el remate: los costados corren de piso a techo y los
   * entrepaños viven entre ellos.
   */
  vuelo: number;
  /** Cuánto vuelan los horizontales por fuera de los verticales, a cada lado. */
  voladizo: number;
  columnas: Columna[];
};

export function armarCuerpo(s: CuerpoSpec): Part[] {
  const P: Part[] = [];
  const { esp, prof, voladizo } = s;

  // El cuerpo va entre los vuelos; los verticales lo desbordan arriba y abajo.
  const z0 = s.vuelo;
  const altoCuerpo = s.alto - 2 * s.vuelo;
  const xIzq = voladizo;
  const anchoVert = s.ancho - 2 * voladizo;
  const anchoInt = anchoVert - 2 * esp;
  const altoInt = altoCuerpo - 2 * esp;

  const vertical = (nombre: string, grupo: string, px: number) =>
    P.push({ nombre, grupo, sx: esp, sy: prof, sz: s.alto, px, py: 0, pz: 0 });

  const horizontal = (nombre: string, grupo: string, pz: number) =>
    P.push({ nombre, grupo, sx: s.ancho, sy: prof, sz: esp, px: 0, py: 0, pz });

  // ---- Costados: los dos verticales exteriores, de piso a techo ----
  vertical('Costado izquierdo', 'Costado', xIzq);
  vertical('Costado derecho', 'Costado', xIzq + anchoVert - esp);

  // ---- Piso y techo del cuerpo, volando por fuera de los costados ----
  horizontal('Entrepaño inferior', 'Entrepaño', z0);
  horizontal('Entrepaño superior', 'Entrepaño', z0 + altoCuerpo - esp);

  // ---- Reparto a lo ancho ----
  const cols = s.columnas;
  const sumaAncho = cols.reduce((a, c) => a + Math.max(0.01, c.anchoRel), 0);
  const anchoUtil = anchoInt - Math.max(0, cols.length - 1) * esp;

  let xCursor = xIzq + esp;
  const geom: { x: number; ancho: number; col: Columna }[] = [];
  for (let i = 0; i < cols.length; i++) {
    const w = (anchoUtil * Math.max(0.01, cols[i].anchoRel)) / sumaAncho;
    geom.push({ x: xCursor, ancho: w, col: cols[i] });
    xCursor += w;
    if (i < cols.length - 1) {
      vertical(`Divisor vertical ${i + 1}`, 'Divisor vertical', xCursor);
      xCursor += esp;
    }
  }

  // ---- Reparto a lo alto, columna por columna ----
  for (let ci = 0; ci < geom.length; ci++) {
    const { x, ancho, col } = geom[ci];
    const celdas = col.celdas;
    const sumaAlto = celdas.reduce((a, c) => a + Math.max(0.01, c.altoRel), 0);
    const altoUtil = altoInt - Math.max(0, celdas.length - 1) * esp;
    const etiqueta = geom.length > 1 ? `C${ci + 1}-` : '';

    let zCursor = z0 + esp;
    for (let ri = 0; ri < celdas.length; ri++) {
      const h = (altoUtil * Math.max(0.01, celdas[ri].altoRel)) / sumaAlto;

      for (let k = 1; k <= celdas[ri].repisas; k++) {
        const paso = h / (celdas[ri].repisas + 1);
        P.push({
          nombre: `Repisa ${etiqueta}${ri + 1}`,
          grupo: 'Repisa',
          sx: ancho - 2,
          sy: prof - 20,
          sz: esp,
          px: x + 1,
          py: 0,
          pz: zCursor + paso * k,
        });
      }

      zCursor += h;

      if (ri < celdas.length - 1) {
        // Los entrepaños intermedios vuelan igual que el piso y el techo.
        horizontal(`Entrepaño ${etiqueta}${ri + 1}`, 'Entrepaño', zCursor);
        zCursor += esp;
      }
    }
  }

  return P;
}

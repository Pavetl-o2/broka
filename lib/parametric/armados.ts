import { armarCuerpo, type Celda } from '@/lib/parametric/cuerpo';
import {
  escala,
  MESA_CUBIERTA,
  MESA_LLAVE,
  MESA_MARCO,
  SILLA_ALMA,
  SILLA_ASIENTO,
  SILLA_COSTADO,
  SILLA_CUNA,
} from '@/lib/parametric/perfiles';
import type { MuebleType, Part, Punto2 } from '@/lib/types';

/** Espesor de tablero en mm. Toda la geometría depende de él. */
export const ESPESOR = 18;

/** El librero se corta en 12: así vienen sus DXF (capa `..._12.000MM`). */
export const ESPESOR_LIBRERO = 12;

export function espesorDe(type: MuebleType): number {
  return type === 'librero' ? ESPESOR_LIBRERO : ESPESOR;
}

// ---------------------------------------------------------------
// Perfiles de cara. Coordenadas en mm desde la esquina mínima de la
// pieza, sobre sus dos ejes mayores (orden x → y → z, saltando el
// del espesor). La caja sigue mandando; esto solo la recorta.
// ---------------------------------------------------------------

/** Rectángulo con las esquinas redondeadas. */
function redondeado(w: number, h: number, r: number, pasos = 4): Punto2[] {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2));
  const pts: Punto2[] = [];
  const esquina = (cx: number, cy: number, desde: number) => {
    for (let i = 0; i <= pasos; i++) {
      const a = desde + (Math.PI / 2) * (i / pasos);
      pts.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]);
    }
  };
  esquina(w - rr, rr, -Math.PI / 2);
  esquina(w - rr, h - rr, 0);
  esquina(rr, h - rr, Math.PI / 2);
  esquina(rr, rr, Math.PI);
  return pts;
}

/** Mueve un contorno ya escalado. */
function mueve(perfil: Punto2[], du: number, dv: number): Punto2[] {
  return perfil.map(([u, v]) => [u + du, v + dv] as Punto2);
}

/** Refleja un contorno sobre su ancho: sirve para el molinete de la mesa. */
function espeja(perfil: Punto2[], u: number): Punto2[] {
  return perfil.map(([a, b]) => [u - a, b] as Punto2).reverse();
}

/**
 * Cambia u por v. El DXF dibuja cada pieza como conviene anidarla, no como se
 * monta; esto la pone en el orden que espera la cara (x → y → z).
 */
function transpon(perfil: Punto2[]): Punto2[] {
  return perfil.map(([u, v]) => [v, u] as Punto2);
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

  if (type === 'silla') {
    // Banco de tapa inclinada. Todo sale de `silla_limpia.dxf`: el costado con
    // sus dos patas abiertas y el canto de arriba subiendo en diagonal, la tapa
    // apoyada en ese canto, el alma que amarra los dos costados y las cuñas que
    // bloquean su espiga. Las fracciones son medidas del plano entre su bbox.
    const kD = 1 / 720.9;
    const kH = 1 / 723.3;

    caja('Costado', 'Costado', t, D, H, 0, 0, 0, escala(SILLA_COSTADO, D, H));
    caja('Costado', 'Costado', t, D, H, W - t, 0, 0, escala(SILLA_COSTADO, D, H));

    // El canto de arriba va de (97, 550) a (573.2, 723.3): 20° de inclinación.
    const inclina = (Math.atan2(173.3 * kH * H, 476.2 * kD * D) * 180) / Math.PI;
    const tapaY = 485 * kD * D;
    caja('Tapa', 'Tapa', W, tapaY, t,
      0, 335.1 * kD * D - tapaY / 2, 636.65 * kH * H - t / 2,
      transpon(escala(SILLA_ASIENTO, tapaY, W)));
    // El canto sube conforme crece y, así que la tapa gira en el sentido que
    // lleva +Y hacia +Z.
    P[P.length - 1].giro = inclina;

    const almaZ = 146 * kH * H;
    caja('Alma', 'Alma', W, t, almaZ, 0, 576 * kD * D - t / 2, 635 * kH * H - almaZ / 2,
      transpon(escala(SILLA_ALMA, almaZ, W)));

    // Las cuñas atraviesan el costado y bloquean la espiga del alma.
    const cuñaX = 66.1 * (W / 450);
    const cuñaZ = 22.4 * kH * H;
    for (const px of [-cuñaX * 0.4, W - cuñaX * 0.6]) {
      caja('Cuña', 'Cuña', cuñaX, t, cuñaZ, px, 576 * kD * D - t / 2, 635 * kH * H - cuñaZ / 2,
        escala(SILLA_CUNA, cuñaX, cuñaZ));
    }
  } else if (type === 'mesa') {
    // Mesa cuadrada de `square_table.dxf`: cubierta de esquinas redondeadas,
    // pasada por cuatro llaves en cruz, sobre cuatro marcos iguales que llevan
    // faldón y pata en la misma pieza. Los marcos giran en molinete, y por eso
    // las cuatro patas salen abiertas hacia esquinas distintas.
    const llaveX = 90 * (W / 1160);
    const llaveY = 90 * (D / 1160.6);
    const cx = [0.1422 * W, 0.8578 * W];
    const cy = [0.1422 * D, 0.8578 * D];

    const huecos: Punto2[][] = [];
    for (const x of cx) {
      for (const y of cy) {
        huecos.push(mueve(escala(MESA_LLAVE, llaveX, llaveY), x - llaveX / 2, y - llaveY / 2));
      }
    }
    caja('Cubierta', 'Cubierta', W, D, t, 0, 0, H - t,
      escala(MESA_CUBIERTA, W, D), huecos);

    const retiro = 19.25 * (Math.min(W, D) / 1160);
    const largoX = W - 2 * retiro;
    const largoY = D - 2 * retiro;
    const alto = H - t;

    caja('Marco', 'Marco', largoX, t, alto, retiro, retiro, 0,
      escala(MESA_MARCO, largoX, alto));
    caja('Marco', 'Marco', largoX, t, alto, retiro, D - retiro - t, 0,
      espeja(escala(MESA_MARCO, largoX, alto), largoX));
    caja('Marco', 'Marco', t, largoY, alto, retiro, retiro, 0,
      espeja(escala(MESA_MARCO, largoY, alto), largoY));
    caja('Marco', 'Marco', t, largoY, alto, W - retiro - t, retiro, 0,
      escala(MESA_MARCO, largoY, alto));

    for (const x of cx) {
      for (const y of cy) {
        // Sobresale 2.5 mm: al ras compite con la cubierta por el mismo plano y
        // el visor no sabe cuál dibujar encima; con el resalte además le entra
        // luz de lado y la cruz se lee, que es como sale en la foto.
        caja('Llave en cruz', 'Llave', llaveX, llaveY, t + 2.5,
          x - llaveX / 2, y - llaveY / 2, H - t,
          escala(MESA_LLAVE, llaveX, llaveY));
      }
    }
  } else if (type === 'banco') {
    // Banca de costillas: un peine de tablas ensartado en dos vigas. El asiento
    // baja al centro, tal como reparte `075y32po.dxf` — la costilla impar es la
    // más baja, y de ahí se sabe que la curva es un valle.
    const n = Math.max(9, Math.round(W / 57.5) | 1);
    const paso = (W - t) / (n - 1);
    // Medidas del plano: la costilla del extremo mide 450 de alto por 527.8 de
    // fondo, y la del centro 182.1 por 604.2. La impar es la más baja, y de ahí
    // se sabe que la curva es un valle y no un arco.
    const hCentro = H * (182.1 / 450);
    const dExtremo = D * (527.8 / 604.2);
    const vigaH = H * 0.22;

    for (let i = 0; i < n; i++) {
      // 0 en los extremos, 1 en el centro.
      const k = 1 - Math.abs(i - (n - 1) / 2) / ((n - 1) / 2);
      const suave = (1 - Math.cos(Math.PI * k)) / 2;
      const sz = H + (hCentro - H) * suave;
      const sy = dExtremo + (D - dExtremo) * suave;
      caja('Costilla', 'Costilla', t, sy, sz, i * paso, (D - sy) / 2, 0,
        redondeado(sy, sz, Math.min(sy, sz) * 0.16));
    }

    const yViga = D * 0.24;
    for (const py of [yViga, D - yViga - t]) {
      caja('Viga', 'Viga', W, t, vigaH, 0, py, hCentro * 0.34,
        redondeado(W, vigaH, vigaH * 0.3));
    }
  } else if (type === 'librero') {
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

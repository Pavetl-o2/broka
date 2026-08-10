import { armarCuerpo, type Celda } from '@/lib/parametric/cuerpo';
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

/** Cruz centrada: la llave que amarra la pata a la cubierta en la mesa. */
function cruz(cx: number, cy: number, lado: number, brazo: number): Punto2[] {
  const a = lado / 2;
  const b = brazo / 2;
  return [
    [cx - b, cy - a], [cx + b, cy - a], [cx + b, cy - b], [cx + a, cy - b],
    [cx + a, cy + b], [cx + b, cy + b], [cx + b, cy + a], [cx - b, cy + a],
    [cx - b, cy + b], [cx - a, cy + b], [cx - a, cy - b], [cx - b, cy - b],
  ];
}

/**
 * Costado en A de la silla: dos patas que se abren hacia el piso y un lomo
 * horizontal arriba, con el vano triangular en medio. Sale del contorno de
 * `silla_limpia.dxf`, escrito en proporciones para que aguante otras medidas.
 */
function costadoEnA(D: number, H: number): Punto2[] {
  const lomo = D * 0.62;
  const pie = D * 0.17;
  const vano = H * 0.78;
  return [
    [0, 0],
    [(D - lomo) / 2, H],
    [(D + lomo) / 2, H],
    [D, 0],
    [D - pie, 0],
    [D / 2 + D * 0.025, vano],
    [D / 2 - D * 0.025, vano],
    [pie, 0],
  ];
}

/** Pata cónica de la mesa: ancha bajo la cubierta, afilada en el piso. */
function pataConica(w: number, h: number): Punto2[] {
  const abajo = w * 0.54;
  const off = (w - abajo) * 0.72;
  return [
    [0, h],
    [w, h],
    [w - (w - abajo - off), 0],
    [off, 0],
  ];
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
    // Caballete desmontable: dos costados en A, asiento, alma y dos cuñas.
    const asiento = D * 0.67;
    const yAsiento = (D - asiento) / 2;
    const alma = H * 0.2;
    const zAlma = H - t - alma - H * 0.06;

    caja('Costado en A', 'Costado', t, D, H, 0, 0, 0, costadoEnA(D, H));
    caja('Costado en A', 'Costado', t, D, H, W - t, 0, 0, costadoEnA(D, H));
    caja('Asiento', 'Asiento', W - 2 * t, asiento, t, t, yAsiento, H - t,
      redondeado(W - 2 * t, asiento, Math.min(28, asiento * 0.08)));
    caja('Alma', 'Alma', W - 2 * t, t, alma, t, D / 2 - t / 2, zAlma);

    // Las cuñas atraviesan el costado y bloquean la espiga del alma.
    const cuña = { l: Math.min(66, W * 0.14), h: Math.min(22, alma * 0.16) };
    for (const px of [-cuña.l * 0.45, W - cuña.l * 0.55]) {
      caja('Cuña', 'Cuña', cuña.l, t, cuña.h, px, D / 2 - t / 2, zAlma + alma * 0.5);
    }
  } else if (type === 'mesa') {
    // Mesa cuadrada: cubierta pasada por cuatro llaves en cruz y cuatro patas
    // cónicas amarradas con faldón. Proporciones de `square_table.dxf`.
    const inset = Math.min(W, D) * 0.145;
    const llave = Math.min(90, Math.min(W, D) * 0.077);
    const brazo = llave * 0.36;
    const pata = Math.min(W, D) * 0.1;
    const faldon = H * 0.14;

    caja('Cubierta', 'Cubierta', W, D, t, 0, 0, H - t,
      redondeado(W, D, Math.min(W, D) * 0.05), [
        cruz(inset, inset, llave, brazo),
        cruz(W - inset, inset, llave, brazo),
        cruz(inset, D - inset, llave, brazo),
        cruz(W - inset, D - inset, llave, brazo),
      ]);

    for (const [px, py] of [
      [inset - pata / 2, inset - pata / 2],
      [W - inset - pata / 2, inset - pata / 2],
      [inset - pata / 2, D - inset - pata / 2],
      [W - inset - pata / 2, D - inset - pata / 2],
    ]) {
      caja('Pata', 'Pata', pata, pata, H - t, px, py, 0, pataConica(pata, H - t));
    }

    // Faldones: uno por lado, entre patas, colgando de la cubierta.
    const luzX = W - 2 * inset - pata;
    const luzY = D - 2 * inset - pata;
    caja('Faldón', 'Faldón', luzX, t, faldon, inset + pata / 2, inset, H - t - faldon);
    caja('Faldón', 'Faldón', luzX, t, faldon, inset + pata / 2, D - inset - t, H - t - faldon);
    caja('Faldón', 'Faldón', t, luzY, faldon, inset, inset + pata / 2, H - t - faldon);
    caja('Faldón', 'Faldón', t, luzY, faldon, W - inset - t, inset + pata / 2, H - t - faldon);

    for (const [px, py] of [
      [inset - llave / 2, inset - llave / 2],
      [W - inset - llave / 2, inset - llave / 2],
      [inset - llave / 2, D - inset - llave / 2],
      [W - inset - llave / 2, D - inset - llave / 2],
    ]) {
      // Sobresale 2.5 mm: al ras compite con la cubierta por el mismo plano y
      // el visor no sabe cuál dibujar encima; con el resalte además le entra
      // luz de lado y la cruz se lee, que es como sale en la foto.
      caja('Llave en cruz', 'Llave', llave, llave, t + 2.5, px, py, H - t,
        cruz(llave / 2, llave / 2, llave, brazo));
    }
  } else if (type === 'banco') {
    // Banca de costillas: un peine de tablas ensartado en dos vigas. El asiento
    // baja al centro, tal como reparte `075y32po.dxf` — la costilla impar es la
    // más baja, y de ahí se sabe que la curva es un valle.
    const n = Math.max(9, Math.round(W / 57.5) | 1);
    const paso = (W - t) / (n - 1);
    // El DXF baja hasta 0.40 del alto, pero a lo largo de sus 1781 mm. En los
    // 1100 del TRAMO esa misma caída parte la banca en dos; la foto pide una
    // curva que se hunda sin quebrarse.
    const hCentro = H * 0.62;
    const dExtremo = D * 0.94;
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

import type { MuebleType, Part } from '@/lib/types';

/** Espesor de tablero en mm. Toda la geometría depende de él. */
export const ESPESOR = 18;

/**
 * Despiece paramétrico. Es la única fuente de verdad del sistema:
 *
 *   partList(type, W, D, H)
 *      ├── geometría 3D  → una malla por pieza, colocada en pos/axis
 *      ├── costo         → área de tablero, metros de ruteo, m² de acabado
 *      └── despiece DXF  → los mismos rectángulos, anidados en hoja
 *
 * Por eso el visor y el precio no pueden contradecirse. Medidas en mm.
 */
export function partList(type: MuebleType, W: number, D: number, H: number): Part[] {
  const t = ESPESOR;
  const P: Part[] = [];
  const add = (
    nombre: string,
    w: number,
    h: number,
    axis: Part['axis'],
    x: number,
    y: number,
    z: number,
    routed?: boolean,
    hole?: Part['hole'],
  ) => P.push({ nombre, w, h, t, axis, pos: [x, y, z], routed: !!routed, hole });

  if (type === 'silla') {
    const seat = Math.min(450, H - 340);
    add('Costado', D, H, 'x', -(W / 2 - t / 2), H / 2, 0, true, {
      w: D - 170,
      h: 110,
      y: -(H / 2) + 55,
    });
    add('Costado', D, H, 'x', W / 2 - t / 2, H / 2, 0, true, {
      w: D - 170,
      h: 110,
      y: -(H / 2) + 55,
    });
    add('Asiento', W - 2 * t, D - 40, 'y', 0, seat, 10);
    add('Respaldo', W - 2 * t, H - seat - 90, 'z', 0, seat + (H - seat - 90) / 2 + 50, -(D / 2 - t / 2));
    add('Travesaño', W - 2 * t, 90, 'z', 0, seat - 190, D / 2 - t / 2 - 30);
  } else if (type === 'mesa' || type === 'banco') {
    const inset = type === 'mesa' ? 190 : 130;
    add('Cubierta', W, D, 'y', 0, H - t / 2, 0);
    add('Caballete', D - 90, H - t, 'x', -(W / 2 - inset), (H - t) / 2, 0, true, {
      w: D - 330,
      h: (H - t) * 0.44,
      y: -((H - t) / 2) + (H - t) * 0.22,
    });
    add('Caballete', D - 90, H - t, 'x', W / 2 - inset, (H - t) / 2, 0, true, {
      w: D - 330,
      h: (H - t) * 0.44,
      y: -((H - t) / 2) + (H - t) * 0.22,
    });
    if (type === 'mesa') add('Travesaño', W - 2 * inset - t, 150, 'z', 0, H * 0.26, 0);
  } else if (type === 'librero') {
    const n = Math.max(3, Math.round(H / 360));
    add('Costado', D, H, 'x', -(W / 2 - t / 2), H / 2, 0);
    add('Costado', D, H, 'x', W / 2 - t / 2, H / 2, 0);
    for (let i = 0; i <= n; i++) {
      add('Entrepaño', W - 2 * t, D - 16, 'y', 0, t / 2 + i * ((H - t) / n), 8);
    }
    add('Trasera', W - 2 * t, H - 2 * t, 'z', 0, H / 2, -(D / 2 - t / 2));
  } else if (type === 'escritorio') {
    add('Cubierta', W, D, 'y', 0, H - t / 2, 0);
    add('Costado', D - 40, H - t, 'x', -(W / 2 - t / 2), (H - t) / 2, 0, true, {
      w: D - 260,
      h: (H - t) * 0.34,
      y: -((H - t) / 2) + (H - t) * 0.17,
    });
    add('Costado', D - 40, H - t, 'x', W / 2 - t / 2, (H - t) / 2, 0, true, {
      w: D - 260,
      h: (H - t) * 0.34,
      y: -((H - t) / 2) + (H - t) * 0.17,
    });
    add('Faldón', W - 2 * t, 190, 'z', 0, H - t - 130, -(D / 2 - t / 2 - 40));
    add('Repisa', 460, D - 90, 'y', -(W / 2) + 260, H - 300, 0);
  } else {
    add('Costado', D, H, 'x', -(W / 2 - t / 2), H / 2, 0);
    add('Costado', D, H, 'x', W / 2 - t / 2, H / 2, 0);
    add('Base', W - 2 * t, D, 'y', 0, t / 2, 0);
    add('Tapa', W - 2 * t, D, 'y', 0, H - t / 2, 0);
    add('Entrepaño', W - 2 * t, D - 20, 'y', 0, H * 0.46, 8);
    add('Trasera', W - 2 * t, H - 2 * t, 'z', 0, H / 2, -(D / 2 - t / 2));
    add('Frente de cajón', W - 2 * t - 8, H * 0.28, 'z', 0, H - t - H * 0.17, D / 2 - t / 2, true, {
      w: (W - 2 * t) * 0.34,
      h: 26,
      y: (H * 0.28) / 2 - 34,
    });
  }

  return P;
}

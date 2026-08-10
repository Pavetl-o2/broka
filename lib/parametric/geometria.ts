import type { Part } from '@/lib/types';

/** mm → metros. La escena 3D trabaja en metros. */
export const S = 0.001;

/** Tamaño de la pieza ya montada, en metros. Todas las rotaciones son de 90°. */
export function extent(p: Part): [number, number, number] {
  if (p.axis === 'x') return [p.t * S, p.h * S, p.w * S];
  if (p.axis === 'y') return [p.w * S, p.t * S, p.h * S];
  return [p.w * S, p.h * S, p.t * S];
}

/** Hacia dónde sale cada pieza al abrir el despiece, en metros. */
export function explodeDir(p: Part, i: number): [number, number, number] {
  return [
    p.axis === 'x' ? Math.sign(p.pos[0] || (i % 2 ? 1 : -1)) * 0.34 : 0,
    p.axis === 'y' ? 0.3 + i * 0.035 : 0.06,
    p.axis === 'z' ? Math.sign(p.pos[2] || -1) * 0.34 : 0,
  ];
}

/**
 * Esfera envolvente del mueble en metros, calculada de la lista de piezas y no
 * de la escena: el encuadre puede resolverse antes del primer render.
 */
export function bounds(parts: Part[], explode: boolean) {
  let minX = Infinity;
  let minY = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let maxZ = -Infinity;

  parts.forEach((p, i) => {
    const [ex, ey, ez] = extent(p);
    const d = explode ? explodeDir(p, i) : [0, 0, 0];
    const cx = p.pos[0] * S + d[0];
    const cy = p.pos[1] * S + d[1];
    const cz = p.pos[2] * S + d[2];
    minX = Math.min(minX, cx - ex / 2);
    maxX = Math.max(maxX, cx + ex / 2);
    minY = Math.min(minY, cy - ey / 2);
    maxY = Math.max(maxY, cy + ey / 2);
    minZ = Math.min(minZ, cz - ez / 2);
    maxZ = Math.max(maxZ, cz + ez / 2);
  });

  const center: [number, number, number] = [
    (minX + maxX) / 2,
    (minY + maxY) / 2,
    (minZ + maxZ) / 2,
  ];
  const radius =
    Math.hypot(maxX - minX, maxY - minY, maxZ - minZ) / 2 || 1;

  return { center, radius };
}

/**
 * Distancia de cámara que mete la esfera envolvente en el frustum, con margen y
 * corregida por aspecto para que el mueble tampoco se salga de lado.
 */
export function camDistance(radius: number, fovDeg: number, aspect: number, explode: boolean) {
  const half = ((fovDeg * Math.PI) / 180) / 2;
  const pad = explode ? 1.52 : 1.18;
  return (radius / Math.sin(half) / Math.min(1, aspect || 1)) * pad;
}

/** Dirección desde la que se mira el mueble al centrar. */
export const CAM_DIR: [number, number, number] = [0.62, 0.36, 0.72];

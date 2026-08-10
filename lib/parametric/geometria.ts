import type { Part } from '@/lib/types';

/** mm → metros. La escena 3D trabaja en metros. */
export const S = 0.001;

/**
 * Las piezas viven en coordenadas de taller (Z arriba, y = 0 al frente) y la
 * escena de three.js es Y arriba. El cambio de ejes ocurre aquí y en ningún
 * otro lugar:
 *
 *   escena.x =  cad.x        ancho
 *   escena.y =  cad.z        alto
 *   escena.z = −cad.y        profundidad, negada para que el frente mire a la cámara
 *
 * Negar Y es lo que deja el frente del mueble del lado del observador; sin eso
 * la cámara encuadraría la trasera.
 */

/** Espesor de la pieza: el menor de sus tres lados. */
export function espesor(p: Part): number {
  return Math.min(p.sx, p.sy, p.sz);
}

/** Eje sobre el que se mide el espesor. Es la normal de la cara. */
export function ejeEspesor(p: Part): 'x' | 'y' | 'z' {
  const t = espesor(p);
  if (p.sx === t) return 'x';
  if (p.sy === t) return 'y';
  return 'z';
}

/**
 * Los dos lados de la cara, en orden x → y → z saltando el del espesor.
 * Es el mismo orden en que `hole` mide u y v, para que no puedan desalinearse.
 */
export function faceDims(p: Part): [number, number] {
  const eje = ejeEspesor(p);
  if (eje === 'x') return [p.sy, p.sz];
  if (eje === 'y') return [p.sx, p.sz];
  return [p.sx, p.sy];
}

/** Tamaño de la caja en la escena, en metros. */
export function extent(p: Part): [number, number, number] {
  return [p.sx * S, p.sz * S, p.sy * S];
}

/** Centro de la pieza en la escena, en metros. La pieza se declara por su esquina mínima. */
export function center3(p: Part): [number, number, number] {
  return [(p.px + p.sx / 2) * S, (p.pz + p.sz / 2) * S, -(p.py + p.sy / 2) * S];
}

/** Hacia dónde sale cada pieza al abrir el despiece, en metros. */
export function explodeDir(p: Part, i: number): [number, number, number] {
  const eje = ejeEspesor(p);
  const [cx, , cz] = center3(p);
  return [
    eje === 'x' ? Math.sign(cx || (i % 2 ? 1 : -1)) * 0.34 : 0,
    eje === 'z' ? 0.3 + i * 0.035 : 0.06,
    eje === 'y' ? Math.sign(cz || 1) * 0.34 : 0,
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
    const c = center3(p);
    const d = explode ? explodeDir(p, i) : [0, 0, 0];
    const cx = c[0] + d[0];
    const cy = c[1] + d[1];
    const cz = c[2] + d[2];
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

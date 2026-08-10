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
  if (p.pose) {
    const c = centroPose(p);
    return [c[0] * S, c[2] * S, -c[1] * S];
  }
  return [(p.px + p.sx / 2) * S, (p.pz + p.sz / 2) * S, -(p.py + p.sy / 2) * S];
}

/** Centro del dibujo de una pieza, en sus propias coordenadas. */
function centroPlano(p: Part): [number, number] {
  const pts = p.perfil ?? [];
  if (!pts.length) return [0, 0];
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [x, y] of pts) {
    x0 = Math.min(x0, x); x1 = Math.max(x1, x);
    y0 = Math.min(y0, y); y1 = Math.max(y1, y);
  }
  return [(x0 + x1) / 2, (y0 + y1) / 2];
}

/** Centro de la pieza colocada, en mm de taller. */
function centroPose(p: Part): [number, number, number] {
  const { o, u, v } = p.pose!;
  const [cx, cy] = centroPlano(p);
  return [
    o[0] + u[0] * cx + v[0] * cy,
    o[1] + u[1] * cx + v[1] * cy,
    o[2] + u[2] * cx + v[2] * cy,
  ];
}

/**
 * Esquinas de una pieza colocada, en la escena y en metros. Con pose la caja
 * alineada a ejes ya no la describe, así que el encuadre mide el contorno real.
 */
export function esquinas3(p: Part): [number, number, number][] {
  const { o, u, v, w } = p.pose!;
  const e = espesor(p) / 2;
  const out: [number, number, number][] = [];
  for (const [x, y] of p.perfil ?? [[0, 0]]) {
    for (const s of [-1, 1]) {
      const cad = [
        o[0] + u[0] * x + v[0] * y + w[0] * e * s,
        o[1] + u[1] * x + v[1] * y + w[1] * e * s,
        o[2] + u[2] * x + v[2] * y + w[2] * e * s,
      ];
      out.push([cad[0] * S, cad[2] * S, -cad[1] * S]);
    }
  }
  return out;
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
    const d = explode ? explodeDir(p, i) : [0, 0, 0];
    const puntos: [number, number, number][] = [];

    if (p.pose) {
      puntos.push(...esquinas3(p));
    } else {
      const [ex, ey, ez] = extent(p);
      const c = center3(p);
      for (const sx of [-1, 1]) {
        for (const sy of [-1, 1]) {
          for (const sz of [-1, 1]) {
            puntos.push([c[0] + (sx * ex) / 2, c[1] + (sy * ey) / 2, c[2] + (sz * ez) / 2]);
          }
        }
      }
    }

    for (const q of puntos) {
      minX = Math.min(minX, q[0] + d[0]);
      maxX = Math.max(maxX, q[0] + d[0]);
      minY = Math.min(minY, q[1] + d[1]);
      maxY = Math.max(maxY, q[1] + d[1]);
      minZ = Math.min(minZ, q[2] + d[2]);
      maxZ = Math.max(maxZ, q[2] + d[2]);
    }
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

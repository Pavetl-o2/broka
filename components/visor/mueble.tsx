'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { armados } from '@/lib/parametric/armados';
import { center3, ejeEspesor, espesor, explodeDir, faceDims, S } from '@/lib/parametric/geometria';
import { CANTO } from '@/lib/parametric/precio';
import type { MuebleType, Part } from '@/lib/types';

/** Veta procedural: da textura al tablero sin depender de archivos externos. */
function useGrain() {
  return useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 512;
    const x = c.getContext('2d')!;
    x.fillStyle = '#8a8a8a';
    x.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 260; i++) {
      const y = Math.random() * 512;
      const g = Math.random() < 0.5 ? 96 : 190;
      x.strokeStyle = `rgba(${g},${g},${g},${0.05 + Math.random() * 0.12})`;
      x.lineWidth = 0.5 + Math.random() * 2.4;
      x.beginPath();
      x.moveTo(0, y);
      for (let px = 0; px <= 512; px += 32) x.lineTo(px, y + Math.sin(px * 0.019 + i) * 3.4);
      x.stroke();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(3, 3);
    return tex;
  }, []);
}

/**
 * Malla de una pieza, centrada en su propio origen. Sin perfil es la caja; con
 * perfil se extruye el contorno de la cara a lo largo del espesor. En ambos
 * casos la geometría se construye en el plano local (u, v) y la rotación de la
 * pieza la lleva al eje que le toca.
 */
function geometriaDe(pt: Part): THREE.BufferGeometry {
  const [fu, fv] = faceDims(pt);
  const t = espesor(pt) * S;

  if (!pt.perfil && !pt.huecos?.length) {
    return new THREE.BoxGeometry(fu * S, fv * S, t);
  }

  // Con pose el contorno viene en las coordenadas del dibujo de corte; se
  // centra en su propia caja porque el origen de la malla es ese centro.
  const contorno: [number, number][] =
    pt.perfil ?? [[0, 0], [fu, 0], [fu, fv], [0, fv]];
  let ox = fu / 2;
  let oy = fv / 2;
  if (pt.pose) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const [x, y] of contorno) {
      x0 = Math.min(x0, x); x1 = Math.max(x1, x);
      y0 = Math.min(y0, y); y1 = Math.max(y1, y);
    }
    ox = (x0 + x1) / 2;
    oy = (y0 + y1) / 2;
  }

  const traza = (pts: [number, number][], path: THREE.Shape | THREE.Path) => {
    pts.forEach(([u, v], i) => {
      const x = (u - ox) * S;
      const y = (v - oy) * S;
      if (i === 0) path.moveTo(x, y);
      else path.lineTo(x, y);
    });
    path.closePath();
  };

  const shape = new THREE.Shape();
  traza(contorno, shape);
  for (const hueco of pt.huecos ?? []) {
    const path = new THREE.Path();
    traza(hueco, path);
    shape.holes.push(path);
  }

  const geo = new THREE.ExtrudeGeometry(shape, { depth: t, bevelEnabled: false, curveSegments: 8 });
  geo.translate(0, 0, -t / 2);
  return geo;
}

/**
 * Matriz de una pieza colocada por el solver. La pose ya es una base completa,
 * así que se pasa entera y three no tiene que interpretar ángulos. El cambio
 * de ejes de taller a escena (Z arriba → Y arriba) se aplica a los tres
 * vectores y al origen por igual.
 */
function matrizDe(pt: Part): THREE.Matrix4 {
  const { o, u, v, w } = pt.pose!;
  // El origen es un punto y va en metros; u, v y w son direcciones y se quedan
  // como están: la malla ya viene en metros y volver a escalarlas la encogería.
  const punto = (p: readonly number[]) => new THREE.Vector3(p[0] * S, p[2] * S, -p[1] * S);
  const dir = (p: readonly number[]) => new THREE.Vector3(p[0], p[2], -p[1]);
  const [cx, cy] = (() => {
    const pts = pt.perfil ?? [[0, 0]];
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const [x, y] of pts) {
      x0 = Math.min(x0, x); x1 = Math.max(x1, x);
      y0 = Math.min(y0, y); y1 = Math.max(y1, y);
    }
    return [(x0 + x1) / 2, (y0 + y1) / 2];
  })();

  const U = dir(u);
  const V = dir(v);
  const W = dir(w);
  const pos = punto(o).addScaledVector(U, cx * S).addScaledVector(V, cy * S);
  return new THREE.Matrix4().makeBasis(U, V, W).setPosition(pos);
}

/**
 * Lleva el plano local de la cara al eje del espesor de la pieza:
 * x → la cara mira a lo ancho, y → mira al frente, z → mira arriba.
 */
function rotacionDe(pt: Part): [number, number, number] {
  const eje = ejeEspesor(pt);
  if (eje === 'x') return [0, Math.PI / 2, 0];
  if (eje === 'z') return [-Math.PI / 2, 0, 0];
  return [0, 0, 0];
}

export function Mueble({
  type,
  color,
  explode,
}: {
  type: MuebleType;
  color: string;
  explode: boolean;
}) {
  const grain = useGrain();
  const group = useRef<THREE.Group>(null);

  const parts = useMemo(() => armados(type), [type]);

  const geometries = useMemo(() => parts.map(geometriaDe), [parts]);
  useEffect(() => () => geometries.forEach((g) => g.dispose()), [geometries]);

  const face = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        roughness: 0.68,
        metalness: 0,
        bumpMap: grain,
        bumpScale: 0.0022,
        roughnessMap: grain,
      }),
    [grain],
  );
  const edge = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        roughness: 0.8,
        metalness: 0,
        bumpMap: grain,
        bumpScale: 0.0016,
      }),
    [grain],
  );

  // El acabado cubre la CARA; el canto queda con el corazón del triplay a la
  // vista. Por eso no se deriva del color: es el material, no el acabado.
  useEffect(() => {
    face.color = new THREE.Color(color);
    edge.color = new THREE.Color(CANTO);
  }, [color, face, edge]);

  useEffect(() => () => {
    face.dispose();
    edge.dispose();
  }, [face, edge]);

  // El despiece se abre y se cierra con una interpolación, no de golpe.
  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const amt = explode ? 1 : 0;
    g.children.forEach((m) => {
      const base = m.userData.base as THREE.Vector3 | undefined;
      const dir = m.userData.dir as THREE.Vector3 | undefined;
      if (!base || !dir) return;
      m.position.lerp(
        new THREE.Vector3(base.x + dir.x * amt, base.y + dir.y * amt, base.z + dir.z * amt),
        0.11,
      );
    });
  });

  return (
    <group ref={group}>
      {parts.map((pt, i) => {
        const base = new THREE.Vector3(...center3(pt));
        const d = explodeDir(pt, i);
        const rotation = rotacionDe(pt);
        const extruida = !!pt.perfil || !!pt.huecos?.length;
        // ExtrudeGeometry: 0 = caras, 1 = canto. BoxGeometry: ±z son las caras.
        const material = extruida ? [face, edge] : [edge, edge, edge, edge, face, face];

        // Colocada por el solver: la pose ya trae la base, no hay nada que componer.
        if (pt.pose) {
          return (
            <mesh
              key={`${pt.nombre}-${i}`}
              geometry={geometries[i]}
              material={material}
              matrixAutoUpdate={false}
              matrix={matrizDe(pt)}
              castShadow
              receiveShadow
            />
          );
        }

        return (
          <mesh
            key={`${pt.nombre}-${i}`}
            geometry={geometries[i]}
            material={material}
            position={base}
            rotation={rotation}
            castShadow
            receiveShadow
            userData={{ base, dir: new THREE.Vector3(d[0], d[1], d[2]) }}
          />
        );
      })}
    </group>
  );
}

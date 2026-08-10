'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { armados } from '@/lib/parametric/armados';
import { center3, ejeEspesor, espesor, explodeDir, faceDims, S } from '@/lib/parametric/geometria';
import type { Dims, MuebleType, Part } from '@/lib/types';

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

  const contorno: [number, number][] =
    pt.perfil ?? [[0, 0], [fu, 0], [fu, fv], [0, fv]];

  const shape = new THREE.Shape();
  contorno.forEach(([u, v], i) => {
    const x = (u - fu / 2) * S;
    const y = (v - fv / 2) * S;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  });
  shape.closePath();

  for (const hueco of pt.huecos ?? []) {
    const path = new THREE.Path();
    hueco.forEach(([u, v], i) => {
      const x = (u - fu / 2) * S;
      const y = (v - fv / 2) * S;
      if (i === 0) path.moveTo(x, y);
      else path.lineTo(x, y);
    });
    path.closePath();
    shape.holes.push(path);
  }

  const geo = new THREE.ExtrudeGeometry(shape, { depth: t, bevelEnabled: false, curveSegments: 8 });
  geo.translate(0, 0, -t / 2);
  return geo;
}

/**
 * Lleva el plano local de la cara al eje del espesor de la pieza:
 * x → la cara mira a lo ancho, y → mira al frente, z → mira arriba.
 */
function rotacionDe(pt: Part): [number, number, number] {
  const eje = ejeEspesor(pt);
  const giro = ((pt.giro ?? 0) * Math.PI) / 180;
  if (eje === 'x') return [giro, Math.PI / 2, 0];
  if (eje === 'z') return [-Math.PI / 2 + giro, 0, 0];
  return [giro, 0, 0];
}

export function Mueble({
  type,
  dims,
  color,
  explode,
}: {
  type: MuebleType;
  dims: Dims;
  color: string;
  explode: boolean;
}) {
  const grain = useGrain();
  const group = useRef<THREE.Group>(null);

  const parts = useMemo(() => armados(type, dims.w, dims.d, dims.h), [type, dims.w, dims.d, dims.h]);

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

  useEffect(() => {
    face.color = new THREE.Color(color);
    edge.color = new THREE.Color(color).lerp(new THREE.Color('#ffffff'), 0.28);
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

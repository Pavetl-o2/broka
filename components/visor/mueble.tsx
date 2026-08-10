'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { partList } from '@/lib/parametric/partList';
import { explodeDir, S } from '@/lib/parametric/geometria';
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

function roundedPath(path: THREE.Shape | THREE.Path, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2));
  path.moveTo(x + rr, y);
  path.lineTo(x + w - rr, y);
  path.quadraticCurveTo(x + w, y, x + w, y + rr);
  path.lineTo(x + w, y + h - rr);
  path.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  path.lineTo(x + rr, y + h);
  path.quadraticCurveTo(x, y + h, x, y + h - rr);
  path.lineTo(x, y + rr);
  path.quadraticCurveTo(x, y, x + rr, y);
}

function geometriaDe(pt: Part): THREE.BufferGeometry {
  const w = pt.w * S;
  const h = pt.h * S;
  const t = pt.t * S;

  if (pt.routed && pt.hole) {
    const shape = new THREE.Shape();
    roundedPath(shape, -w / 2, -h / 2, w, h, Math.min(w, h) * 0.06);
    const hole = new THREE.Path();
    roundedPath(
      hole,
      -(pt.hole.w * S) / 2,
      pt.hole.y * S - (pt.hole.h * S) / 2,
      pt.hole.w * S,
      pt.hole.h * S,
      Math.min(pt.hole.w, pt.hole.h) * S * 0.45,
    );
    shape.holes.push(hole);
    const geo = new THREE.ExtrudeGeometry(shape, { depth: t, bevelEnabled: false, curveSegments: 10 });
    geo.translate(0, 0, -t / 2);
    return geo;
  }

  return new THREE.BoxGeometry(w, h, t);
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

  const parts = useMemo(() => partList(type, dims.w, dims.d, dims.h), [type, dims.w, dims.d, dims.h]);

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
        const base = new THREE.Vector3(pt.pos[0] * S, pt.pos[1] * S, pt.pos[2] * S);
        const d = explodeDir(pt, i);
        const rotation: [number, number, number] =
          pt.axis === 'x' ? [0, Math.PI / 2, 0] : pt.axis === 'y' ? [-Math.PI / 2, 0, 0] : [0, 0, 0];
        // ExtrudeGeometry: 0 = caras, 1 = canto. BoxGeometry: ±z son las caras.
        const material = pt.routed && pt.hole ? [face, edge] : [edge, edge, edge, edge, face, face];

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

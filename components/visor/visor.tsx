'use client';

import { OrbitControls } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { Mueble } from '@/components/visor/mueble';
import { bounds, camDistance, CAM_DIR } from '@/lib/parametric/geometria';
import { partList } from '@/lib/parametric/partList';
import type { Dims, MuebleType } from '@/lib/types';

const FOV = 32;

/**
 * Encuadre. Al cambiar de producto recoloca la cámara; al cambiar de medida o
 * abrir el despiece solo la empuja hacia atrás si el mueble ya no cabe, para no
 * robarle al usuario el ángulo que eligió.
 */
function Encuadre({
  type,
  dims,
  explode,
  recentrar,
  controls,
}: {
  type: MuebleType;
  dims: Dims;
  explode: boolean;
  recentrar: number;
  controls: React.RefObject<OrbitControlsImpl | null>;
}) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const primero = useRef(true);

  const esfera = useMemo(
    () => bounds(partList(type, dims.w, dims.d, dims.h), explode),
    [type, dims.w, dims.d, dims.h, explode],
  );

  useEffect(() => {
    const aspect = size.width / Math.max(1, size.height);
    const d = camDistance(esfera.radius, FOV, aspect, explode);
    const center = new THREE.Vector3(...esfera.center);

    camera.near = Math.max(0.02, d * 0.02);
    camera.far = d * 14;
    camera.updateProjectionMatrix();

    const mover = primero.current || recentrar > 0;
    primero.current = false;

    if (mover) {
      const dir = new THREE.Vector3(...CAM_DIR).normalize();
      camera.position.copy(center).add(dir.multiplyScalar(d));
    } else {
      const cur = camera.position.clone().sub(center);
      if (cur.length() < d) camera.position.copy(center).add(cur.normalize().multiplyScalar(d));
    }

    if (controls.current) {
      controls.current.target.copy(center);
      controls.current.update();
    }
  }, [camera, size.width, size.height, esfera, explode, recentrar, controls]);

  return null;
}

export default function Visor({
  type,
  dims,
  color,
  rotate,
  explode,
  grid,
  recentrar,
}: {
  type: MuebleType;
  dims: Dims;
  color: string;
  rotate: boolean;
  explode: boolean;
  grid: boolean;
  recentrar: number;
}) {
  const controls = useRef<OrbitControlsImpl>(null);

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      camera={{ fov: FOV, near: 0.05, far: 100 }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
      }}
      style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none' }}
    >
      <hemisphereLight args={[0xffffff, 0xe8e8e8, 0.7]} />
      <directionalLight
        position={[2.4, 3.4, 2.0]}
        intensity={1.12}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0012}
        shadow-camera-left={-2.2}
        shadow-camera-right={2.2}
        shadow-camera-top={2.2}
        shadow-camera-bottom={-2.2}
        shadow-camera-near={0.1}
        shadow-camera-far={12}
      />
      <directionalLight position={[-2.8, 1.6, -1.9]} intensity={0.34} color={0xdfe6ef} />
      <directionalLight position={[0, 1.4, -3.2]} intensity={0.22} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <shadowMaterial opacity={0.17} />
      </mesh>

      {grid && (
        <gridHelper
          args={[8, 32, 0x8c8c8c, 0xc4c4c4]}
          position={[0, 0.001, 0]}
          material-transparent
          material-opacity={0.34}
        />
      )}

      <Mueble type={type} dims={dims} color={color} explode={explode} />

      <OrbitControls
        ref={controls}
        enableDamping
        dampingFactor={0.06}
        minPolarAngle={0.18}
        maxPolarAngle={Math.PI / 2 - 0.03}
        autoRotate={rotate}
        autoRotateSpeed={0.9}
      />
      <Encuadre
        type={type}
        dims={dims}
        explode={explode}
        recentrar={recentrar}
        controls={controls}
      />
    </Canvas>
  );
}

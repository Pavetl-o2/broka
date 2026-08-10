'use client';

import dynamic from 'next/dynamic';
import { Component, type ReactNode } from 'react';
import type { Dims, MuebleType } from '@/lib/types';

function Cargando() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-[14px] bg-paper">
      <span className="brk-spin block h-[22px] w-[22px] rounded-full border border-n75 border-t-ink" />
      <p className="text-[10px] tracking-[0.18em] text-n52 uppercase">Cargando modelo</p>
    </div>
  );
}

const Visor = dynamic(() => import('@/components/visor/visor'), {
  ssr: false,
  loading: Cargando,
});

/**
 * Si el navegador no puede con WebGL, el visor avisa hacia arriba y la ficha
 * cae a la galería fotográfica.
 */
class SiFalla extends Component<{ onFail: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onFail();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function Lienzo({
  type,
  dims,
  color,
  rotate,
  explode,
  grid,
  recentrar,
  onFail,
}: {
  type: MuebleType;
  dims: Dims;
  color: string;
  rotate: boolean;
  explode: boolean;
  grid: boolean;
  recentrar: number;
  onFail: () => void;
}) {
  return (
    <SiFalla onFail={onFail}>
      <Visor
        type={type}
        dims={dims}
        color={color}
        rotate={rotate}
        explode={explode}
        grid={grid}
        recentrar={recentrar}
      />
    </SiFalla>
  );
}

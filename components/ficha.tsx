'use client';

import { useMemo, useState } from 'react';
import { ImageSlot } from '@/components/image-slot';
import { Lienzo } from '@/components/visor/lienzo';
import { money, sizeLabel } from '@/lib/format';
import { ESPESOR } from '@/lib/parametric/armados';
import { cost, FIN, IVA } from '@/lib/parametric/precio';
import { useTienda } from '@/lib/store';
import type { FinishKey, Producto } from '@/lib/types';

const tab = (activo: boolean) =>
  `px-[18px] py-2.5 text-[10px] tracking-[0.16em] uppercase cursor-pointer ${
    activo ? 'bg-ink text-white' : 'bg-transparent text-n35'
  }`;

const pill = (activo: boolean) =>
  `cursor-pointer border border-[oklch(0.15_0.004_100/0.22)] px-[13px] py-2 text-[9.5px] tracking-[0.14em] uppercase ${
    activo ? 'bg-ink text-white' : 'bg-paper text-n35'
  }`;

export function Ficha({ producto: p }: { producto: Producto }) {
  const [finish, setFinish] = useState<FinishKey>(p.finishes[0]);
  const [stage, setStage] = useState<'3d' | 'foto'>('3d');
  const [galIx, setGalIx] = useState(0);
  const [rotate, setRotate] = useState(true);
  const [explode, setExplode] = useState(false);
  const [grid, setGrid] = useState(true);
  const [recentrar, setRecentrar] = useState(0);
  const [viewerFailed, setViewerFailed] = useState(false);

  const add = useTienda((s) => s.add);
  const wish = useTienda((s) => s.wish);
  const toggleWish = useTienda((s) => s.toggleWish);
  const wished = wish.includes(p.id);

  const est = useMemo(() => cost(p, finish), [p, finish]);
  const showViewer = stage === '3d' && !viewerFailed;

  return (
    <div className="mx-auto grid max-w-[1480px] grid-cols-[repeat(auto-fit,minmax(min(340px,100%),1fr))] items-start gap-[clamp(28px,3.6vw,64px)] px-[clamp(16px,4vw,52px)] pb-[clamp(56px,7vw,96px)]">
      {/* ── Visor ── */}
      <div className="sticky top-[76px]">
        <div className="mb-3 flex w-max border border-ink">
          <button type="button" onClick={() => setStage('3d')} className={tab(stage === '3d')}>
            3D en vivo
          </button>
          <button
            type="button"
            onClick={() => setStage('foto')}
            className={`${tab(stage === 'foto')} border-l border-ink`}
          >
            Fotografía
          </button>
        </div>

        {showViewer ? (
          <>
            <div className="relative aspect-square overflow-hidden border border-ink bg-paper">
              <Lienzo
                type={p.type}
                color={FIN[finish].c}
                rotate={rotate}
                explode={explode}
                grid={grid}
                recentrar={recentrar}
                onFail={() => setViewerFailed(true)}
              />

              <div className="pointer-events-none absolute top-[14px] left-[14px] text-[9.5px] tracking-[0.16em] text-n45 uppercase">
                {sizeLabel(p.medida)}
              </div>
              <div className="pointer-events-none absolute top-[14px] right-[14px] text-[9.5px] tracking-[0.16em] text-n45 uppercase">
                {FIN[finish].n}
              </div>

              <div className="absolute right-[14px] bottom-[14px] left-[14px] flex flex-wrap gap-1.5">
                <button type="button" onClick={() => setRotate(!rotate)} className={pill(rotate)}>
                  Girar
                </button>
                <button type="button" onClick={() => setExplode(!explode)} className={pill(explode)}>
                  Despiece
                </button>
                <button type="button" onClick={() => setGrid(!grid)} className={pill(grid)}>
                  Cuadrícula
                </button>
                <button
                  type="button"
                  onClick={() => setRecentrar((n) => n + 1)}
                  className="cursor-pointer border border-[oklch(0.15_0.004_100/0.22)] bg-transparent px-[13px] py-2 text-[9.5px] tracking-[0.14em] text-n35 uppercase"
                >
                  Centrar
                </button>
              </div>
            </div>
            <p className="mt-2.5 text-[10.5px] tracking-[0.06em] text-n55">
              Arrastra para girar · rueda para acercar · clic derecho para desplazar
            </p>
          </>
        ) : (
          <div>
            <div className="aspect-square bg-n93">
              <ImageSlot
                id={`brk-g-${p.id}-${galIx}`}
                placeholder={p.images[galIx] ?? p.images[0]}
                sizes="(max-width: 768px) 100vw, 45vw"
              />
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {p.images.map((im, i) => (
                <button
                  key={im}
                  type="button"
                  onClick={() => setGalIx(i)}
                  className="block aspect-square cursor-pointer bg-n93 outline-offset-[-1px]"
                  style={{ outline: `1px solid ${i === galIx ? 'oklch(0.15 0.004 100)' : 'transparent'}` }}
                >
                  <ImageSlot id={`brk-g-${p.id}-${i}`} placeholder={im} sizes="15vw" />
                </button>
              ))}
            </div>
          </div>
        )}

        {viewerFailed && (
          <p className="mt-2.5 border-l-2 border-ink pl-3 text-[11px] leading-[1.55] text-n50">
            No pudimos cargar el visor 3D en este navegador. Te mostramos la galería fotográfica.
          </p>
        )}
      </div>

      {/* ── Compra ── */}
      <div>
        <div className="mt-0.5 mb-[26px]">
          <div className="flex flex-wrap items-baseline gap-3">
            <span className="text-[38px] leading-none font-normal">{money(est.total)}</span>
            <span className="text-[11px] tracking-[0.1em] text-n55 uppercase">sin IVA</span>
          </div>
          <p className="mt-2 text-[11.5px] text-n55">
            {money(Math.round(est.total * (1 + IVA)))} con IVA incluido
          </p>
        </div>

        <div className="mb-[26px]">
          <div className="mb-3 flex items-baseline justify-between">
            <p className="text-[9.5px] tracking-[0.2em] text-n52 uppercase">Acabado</p>
            <p className="text-[11.5px] text-n35">{FIN[finish].n}</p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {p.finishes.map((k) => (
              <button
                key={k}
                type="button"
                title={FIN[k].n}
                aria-label={FIN[k].n}
                onClick={() => setFinish(k)}
                className="block h-[44px] w-[44px] cursor-pointer rounded-full"
                style={{
                  background: FIN[k].c,
                  outline: `1px solid ${k === finish ? 'oklch(0.15 0.004 100)' : 'oklch(0.15 0.004 100 / 0.16)'}`,
                  outlineOffset: k === finish ? '3px' : '-1px',
                }}
              />
            ))}
          </div>
        </div>

        {/* Medida: una sola, la del DXF con el que se cortó y se probó. */}
        <div className="mb-[26px]">
          <p className="mb-3 text-[9.5px] tracking-[0.2em] text-n52 uppercase">Medida</p>
          <div className="flex items-baseline justify-between gap-[14px] border border-ink px-[18px] py-[15px]">
            <span className="text-[13.5px]">Largo × fondo × alto</span>
            <span className="text-[11.5px] whitespace-nowrap text-n50">{sizeLabel(p.medida)}</span>
          </div>
          <p className="mt-2.5 text-[11px] leading-[1.55] text-n55">
            Medida única. Cada pieza se corta del archivo con el que se armó y se probó
            en taller, así que el modelo que ves es el que llega.
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={() =>
              add({
                key: `${p.id}|${finish}`,
                id: p.id,
                n: p.nameES,
                ph: p.images[0],
                finish,
                finishName: FIN[finish].n,
                dimsLabel: sizeLabel(p.medida),
                unit: est.total,
              })
            }
            className="cursor-pointer bg-ink px-6 py-[17px] text-center text-[10.5px] tracking-[0.2em] text-white uppercase"
          >
            Añadir al carrito · {money(est.total)}
          </button>
          <button
            type="button"
            onClick={() => toggleWish(p.id)}
            className="cursor-pointer border border-ink px-6 py-[15px] text-center text-[10.5px] tracking-[0.2em] uppercase transition-colors hover:bg-n92"
          >
            {wished ? 'Quitar de favoritos' : 'Guardar en favoritos'}
          </button>
        </div>

        <div className="mt-[22px] flex flex-col gap-[9px] border-t border-ink pt-[18px]">
          <p className="text-[12px] leading-[1.6] text-n48">
            <strong className="font-medium text-n28">Preventa.</strong> La producción del lote
            actual inicia el 15 de septiembre.
          </p>
          <p className="text-[12px] leading-[1.6] text-n48">
            Entrega estimada de 4 a 6 semanas. Envío nacional incluido en pedidos desde $10,000 MXN.
          </p>
        </div>

        <div className="mt-[26px] border-t border-ink">
          {[
            {
              t: 'Materiales y acabado',
              b: `${p.materialES} de ${ESPESOR[p.type]} mm, con canto visto sellado a mano.\nAcabado al agua de bajo VOC en ${FIN[finish].n.toLowerCase()}.\nSe limpia con paño húmedo y jabón neutro; nunca con solventes.`,
            },
            {
              t: 'Medidas y despiece',
              b: `${sizeLabel(p.medida)}.\n${est.piezas} piezas cortadas de ${est.hojas.toFixed(2)} hojas de tablero.\n${est.perim.toFixed(1)} m de trayectoria de ruteo, tolerancia ±0.1 mm.`,
            },
            {
              t: 'Ensamble y envío',
              b: 'Llega en caja plana con las piezas numeradas, instructivo y llave de ensamble.\nDos personas, entre 20 y 45 minutos según la pieza.\nEnvío nacional incluido en pedidos desde $10,000 MXN.',
            },
          ].map((a) => (
            <details key={a.t} className="group border-b border-ink">
              <summary className="flex items-center justify-between py-[17px] text-[11px] tracking-[0.16em] uppercase">
                {a.t}
                <span className="text-[16px] leading-none text-n55 group-open:hidden">+</span>
                <span className="hidden text-[16px] leading-none text-n55 group-open:inline">−</span>
              </summary>
              <div className="max-w-[52ch] pb-[18px] text-[13px] leading-[1.7] whitespace-pre-line text-n46">
                {a.b}
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}

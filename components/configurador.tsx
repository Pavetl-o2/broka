'use client';

import { useMemo, useState } from 'react';
import { ImageSlot } from '@/components/image-slot';
import { Lienzo } from '@/components/visor/lienzo';
import { money, sizeLabel } from '@/lib/format';
import { cost, FIN, IVA } from '@/lib/parametric/precio';
import { useTienda } from '@/lib/store';
import type { Dims, FinishKey, Producto } from '@/lib/types';

const tab = (activo: boolean) =>
  `px-[18px] py-2.5 text-[10px] tracking-[0.16em] uppercase cursor-pointer ${
    activo ? 'bg-ink text-white' : 'bg-transparent text-n35'
  }`;

const pill = (activo: boolean) =>
  `cursor-pointer border border-[oklch(0.15_0.004_100/0.22)] px-[13px] py-2 text-[9.5px] tracking-[0.14em] uppercase ${
    activo ? 'bg-ink text-white' : 'bg-paper text-n35'
  }`;

export function Configurador({ producto: p }: { producto: Producto }) {
  const [finish, setFinish] = useState<FinishKey>(p.finishes[0]);
  const [sizeIx, setSizeIx] = useState(0);
  const [mode, setMode] = useState<'talla' | 'especial'>('talla');
  const [custom, setCustom] = useState<Dims | null>(null);
  const [stage, setStage] = useState<'3d' | 'foto'>('3d');
  const [galIx, setGalIx] = useState(0);
  const [quoted, setQuoted] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [rotate, setRotate] = useState(true);
  const [explode, setExplode] = useState(false);
  const [grid, setGrid] = useState(true);
  const [recentrar, setRecentrar] = useState(0);
  const [viewerFailed, setViewerFailed] = useState(false);

  const add = useTienda((s) => s.add);
  const wish = useTienda((s) => s.wish);
  const toggleWish = useTienda((s) => s.toggleWish);
  const wished = wish.includes(p.id);

  const size = p.sizes[Math.min(sizeIx, p.sizes.length - 1)];
  const dims: Dims = mode === 'especial' && custom ? custom : { w: size.w, d: size.d, h: size.h };
  const est = useMemo(() => cost(p, dims.w, dims.d, dims.h, finish), [p, dims, finish]);

  const showViewer = stage === '3d' && !viewerFailed;

  const setDim = (clave: keyof Dims, valorCm: number) =>
    setCustom({ ...dims, [clave]: valorCm * 10 });

  const enviarCotizacion = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setEnviando(true);
    try {
      await fetch('/api/cotizacion', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          nombre: form.get('nombre'),
          email: form.get('email'),
          mensaje: form.get('mensaje'),
          producto: p.nameES,
          acabado: FIN[finish].n,
          medidas: sizeLabel(dims),
          estimado: est.total,
        }),
      });
    } finally {
      setEnviando(false);
      setQuoted(true);
    }
  };

  return (
    <div className="mx-auto grid max-w-[1480px] grid-cols-[repeat(auto-fit,minmax(340px,1fr))] items-start gap-[clamp(28px,3.6vw,64px)] px-[clamp(16px,4vw,52px)] pb-[clamp(56px,7vw,96px)]">
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
            <div className="relative aspect-square min-h-[380px] overflow-hidden border border-ink bg-paper">
              <Lienzo
                type={p.type}
                dims={dims}
                color={FIN[finish].c}
                rotate={rotate}
                explode={explode}
                grid={grid}
                recentrar={recentrar}
                onFail={() => setViewerFailed(true)}
              />

              <div className="pointer-events-none absolute top-[14px] left-[14px] text-[9.5px] tracking-[0.16em] text-n45 uppercase">
                {sizeLabel(dims)}
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

      {/* ── Configurador ── */}
      <div>
        <div className="mt-0.5 mb-[26px]">
          <div className="flex flex-wrap items-baseline gap-3">
            <span className="text-[38px] leading-none font-normal">{money(est.total)}</span>
            <span className="text-[11px] tracking-[0.1em] text-n55 uppercase">
              {mode === 'especial' ? 'estimado, sin IVA' : 'sin IVA'}
            </span>
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

        <div className="mb-[26px]">
          <div className="mb-[14px] flex w-max border border-ink">
            <button
              type="button"
              onClick={() => {
                setMode('talla');
                setCustom(null);
              }}
              className={tab(mode === 'talla')}
            >
              Medidas estándar
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('especial');
                setCustom({ ...dims });
                setQuoted(false);
              }}
              className={`${tab(mode === 'especial')} border-l border-ink`}
            >
              Medida especial
            </button>
          </div>

          {mode === 'talla' ? (
            <div className="flex flex-col gap-2">
              {p.sizes.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSizeIx(i)}
                  className={`flex cursor-pointer items-baseline justify-between gap-[14px] border border-ink px-[18px] py-[15px] ${
                    i === sizeIx ? 'bg-n93' : 'bg-transparent'
                  }`}
                >
                  <span className="text-[13.5px]">{s.nameES}</span>
                  <span className="text-[11.5px] whitespace-nowrap text-n50">
                    {sizeLabel({ w: s.w, d: s.d, h: s.h })}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="border border-ink p-5">
              {([
                { clave: 'w' as const, label: 'Largo' },
                { clave: 'd' as const, label: 'Fondo' },
                { clave: 'h' as const, label: 'Alto' },
              ]).map(({ clave, label }) => {
                const min = Math.round(p.rango[clave][0] / 10);
                const max = Math.round(p.rango[clave][1] / 10);
                const value = Math.round(dims[clave] / 10);
                return (
                  <div key={clave} className="mb-[18px]">
                    <div className="mb-2 flex items-baseline justify-between">
                      <span className="text-[10px] tracking-[0.16em] text-n52 uppercase">
                        {label}
                      </span>
                      <span className="text-[13px]">{value} cm</span>
                    </div>
                    <input
                      type="range"
                      min={min}
                      max={max}
                      step={1}
                      value={value}
                      aria-label={`${label} en centímetros`}
                      onChange={(e) => setDim(clave, Number(e.target.value))}
                      className="block w-full"
                    />
                    <div className="mt-[5px] flex justify-between text-[10px] text-n62">
                      <span>{min}</span>
                      <span>{max}</span>
                    </div>
                  </div>
                );
              })}

              <div className="border-t border-n82 pt-[14px]">
                <p className="mb-2.5 text-[9.5px] tracking-[0.18em] text-n52 uppercase">
                  Cómo sale el estimado
                </p>
                <div className="flex flex-col gap-1.5">
                  {[
                    {
                      label: `Tablero · ${est.hojas.toFixed(2)} hojas de 2.44 × 1.22 m`,
                      value: money(Math.round(est.cHojas)),
                    },
                    {
                      label: `Tiempo de máquina · ${est.perim.toFixed(1)} m de ruteo`,
                      value: money(Math.round(est.cRuteo)),
                    },
                    {
                      label: `Acabado · ${(est.area * 2).toFixed(2)} m² sellados`,
                      value: money(Math.round(est.cAcab)),
                    },
                    {
                      label: `Herraje y empaque · ${est.piezas} piezas`,
                      value: money(est.herraje),
                    },
                  ].map((c) => (
                    <div
                      key={c.label}
                      className="flex justify-between gap-[14px] text-[12px] text-n45"
                    >
                      <span>{c.label}</span>
                      <span className="whitespace-nowrap">{c.value}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-[11px] leading-[1.55] text-n55">
                  Estimado orientativo. Confirmamos precio en firme al revisar tu medida.
                </p>
              </div>
            </div>
          )}
        </div>

        {mode === 'talla' ? (
          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() =>
                add({
                  key: `${p.id}|${finish}|${size.id}`,
                  id: p.id,
                  n: p.nameES,
                  ph: p.images[0],
                  finish,
                  sizeId: size.id,
                  finishName: FIN[finish].n,
                  sizeName: size.nameES,
                  dimsLabel: sizeLabel({ w: size.w, d: size.d, h: size.h }),
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
        ) : quoted ? (
          <div className="brk-fade-slow border-l-2 border-ink py-4 pl-[18px]">
            <p className="mb-1.5 text-[24px] font-normal">Recibimos tu solicitud.</p>
            <p className="max-w-[42ch] text-[12.5px] leading-[1.65] text-n48">
              Te respondemos en 24 a 48 horas hábiles con el precio en firme y el tiempo de
              producción para {sizeLabel(dims)} en {FIN[finish].n}.
            </p>
          </div>
        ) : (
          <form onSubmit={enviarCotizacion} className="flex flex-col gap-2.5">
            <input
              name="nombre"
              type="text"
              required
              placeholder="Nombre completo"
              className="border border-ink bg-transparent px-4 py-[14px] text-[14px] outline-none"
            />
            <input
              name="email"
              type="email"
              required
              placeholder="tu@correo.com"
              className="border border-ink bg-transparent px-4 py-[14px] text-[14px] outline-none"
            />
            <textarea
              name="mensaje"
              rows={3}
              placeholder="Cuéntanos dónde va la pieza o cualquier detalle de la medida."
              className="resize-y border border-ink bg-transparent px-4 py-[14px] text-[14px] outline-none"
            />
            <button
              type="submit"
              disabled={enviando}
              className="cursor-pointer border-0 bg-ink px-6 py-[17px] text-[10.5px] tracking-[0.2em] text-white uppercase disabled:opacity-70"
            >
              {enviando ? 'Enviando…' : 'Solicitar cotización'}
            </button>
          </form>
        )}

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
              b: `${p.materialES} de 18 mm, con canto visto sellado a mano.\nAcabado al agua de bajo VOC en ${FIN[finish].n.toLowerCase()}.\nSe limpia con paño húmedo y jabón neutro; nunca con solventes.`,
            },
            {
              t: 'Medidas y despiece',
              b: `${sizeLabel(dims)}.\n${est.piezas} piezas cortadas de ${est.hojas.toFixed(2)} hojas de tablero.\n${est.perim.toFixed(1)} m de trayectoria de ruteo, tolerancia ±0.1 mm.`,
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

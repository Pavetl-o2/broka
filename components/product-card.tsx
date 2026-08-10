import Link from 'next/link';
import { ImageSlot } from '@/components/image-slot';
import { numeroDe } from '@/lib/data/products';
import { money } from '@/lib/format';
import { desdeOf, FIN } from '@/lib/parametric/precio';
import type { Producto } from '@/lib/types';

/** Ficha del Home: numerada, con tira de swatches rectangular y botón sólido. */
export function ProductCardHome({ p }: { p: Producto }) {
  return (
    <article className="flex flex-col border-t border-ink pt-3">
      <div className="mb-[14px] flex justify-between text-[10px] tracking-[0.14em] uppercase">
        <span>{numeroDe(p.id)}</span>
        <span>{p.category}</span>
      </div>

      <Link href={`/producto/${p.id}`} className="block aspect-[4/5] bg-n93">
        <ImageSlot id={`brk-p-${p.id}`} placeholder={p.images[0]} sizes="(max-width: 768px) 100vw, 30vw" />
      </Link>

      <div className="mt-3 flex w-max border border-ink">
        {p.finishes.map((k) => (
          <span
            key={k}
            title={FIN[k].n}
            className="block h-[13px] w-[26px]"
            style={{ background: FIN[k].c }}
          />
        ))}
      </div>

      <h3 className="mt-[14px] text-[19px] font-normal tracking-[-0.022em]">
        <Link href={`/producto/${p.id}`}>{p.nameES}</Link>
      </h3>
      <p className="mt-1.5 text-[12px] leading-[1.5] text-n44">
        Disponible en {p.sizes.length} medidas y {p.finishes.length} acabados
      </p>

      <div className="mt-auto flex items-baseline justify-between gap-3 pt-4">
        <span className="text-[14px] tracking-[-0.01em]">Desde {money(desdeOf(p))}</span>
        <span className="text-[10px] tracking-[0.12em] text-n52 uppercase">Sin IVA</span>
      </div>

      <Link
        href={`/producto/${p.id}`}
        className="mt-3 bg-ink px-5 py-[13px] text-center text-[9.5px] tracking-[0.18em] text-white uppercase"
      >
        Personalizar
      </Link>
    </article>
  );
}

/** Ficha del catálogo y de favoritos: cuadrada, swatches redondos, botón de contorno. */
export function ProductCardGrid({ p, children }: { p: Producto; children?: React.ReactNode }) {
  return (
    <article className="flex flex-col">
      <Link href={`/producto/${p.id}`} className="block aspect-square bg-n93">
        <ImageSlot id={`brk-p-${p.id}`} placeholder={p.images[0]} sizes="(max-width: 768px) 100vw, 30vw" />
      </Link>

      <div className="mt-[14px] flex gap-1.5">
        {p.finishes.map((k) => (
          <span
            key={k}
            title={FIN[k].n}
            className="block h-[15px] w-[15px] rounded-full border border-[oklch(0.15_0.004_100/0.16)]"
            style={{ background: FIN[k].c }}
          />
        ))}
      </div>

      <div className="mt-[14px] flex items-baseline justify-between gap-[14px]">
        <h3 className="text-[23px] font-normal">
          <Link href={`/producto/${p.id}`}>{p.nameES}</Link>
        </h3>
        <span className="text-[12px] whitespace-nowrap text-n30">Desde {money(desdeOf(p))}</span>
      </div>

      <p className="mt-[7px] text-[11px] tracking-[0.09em] text-n53 uppercase">
        Disponible en {p.sizes.length} medidas y {p.finishes.length} acabados
      </p>
      <p className="mt-1 text-[10.5px] text-n60">{p.materialES} · sin IVA</p>

      {children ?? (
        <Link
          href={`/producto/${p.id}`}
          className="mt-4 border border-ink px-5 py-[13px] text-center text-[10px] tracking-[0.19em] uppercase transition-colors duration-200 hover:bg-ink hover:text-white"
        >
          Personalizar
        </Link>
      )}
    </article>
  );
}

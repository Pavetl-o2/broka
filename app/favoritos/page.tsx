'use client';

import Link from 'next/link';
import { ProductCardGrid } from '@/components/product-card';
import { PRODUCTS } from '@/lib/data/products';
import { useHydrated, useTienda } from '@/lib/store';

export default function FavoritosPage() {
  const hydrated = useHydrated();
  const wish = useTienda((s) => s.wish);
  const toggleWish = useTienda((s) => s.toggleWish);
  const items = hydrated ? PRODUCTS.filter((p) => wish.includes(p.id)) : [];

  return (
    <main className="brk-fade mx-auto min-h-[60vh] max-w-[1480px] px-[clamp(16px,4vw,52px)] pt-[clamp(34px,4.6vw,64px)] pb-[clamp(60px,7vw,100px)]">
      <p className="mb-3 text-[9.5px] tracking-[0.2em] text-n50 uppercase">Tu selección</p>
      <h1 className="mb-[clamp(28px,3.4vw,46px)] text-[clamp(34px,5vw,68px)] leading-[1.02] font-light tracking-[-0.038em]">
        Favoritos
      </h1>

      {items.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(292px,1fr))] gap-[clamp(22px,2.6vw,40px)]">
          {items.map((p) => (
            <ProductCardGrid key={p.id} p={p}>
              <div className="mt-4 flex gap-2">
                <Link
                  href={`/producto/${p.id}`}
                  className="flex-1 bg-ink px-4 py-[13px] text-center text-[10px] tracking-[0.16em] text-white uppercase"
                >
                  Personalizar
                </Link>
                <button
                  type="button"
                  onClick={() => toggleWish(p.id)}
                  className="cursor-pointer border border-ink px-4 py-[13px] text-center text-[10px] tracking-[0.16em] uppercase"
                >
                  Quitar
                </button>
              </div>
            </ProductCardGrid>
          ))}
        </div>
      ) : (
        <div className="max-w-[44ch] border-t border-ink pt-8">
          <p className="mb-[18px] text-[26px] leading-[1.3] font-light text-n40">
            Aún no has guardado piezas.
          </p>
          <Link
            href="/catalogo"
            className="inline-block border border-ink px-[26px] py-[14px] text-[10px] tracking-[0.19em] uppercase"
          >
            Ver catálogo
          </Link>
        </div>
      )}
    </main>
  );
}

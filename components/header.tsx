'use client';

import Link from 'next/link';
import { useHydrated, useTienda } from '@/lib/store';

const linkCls = 'text-[10px] tracking-[0.17em] whitespace-nowrap uppercase';

export function Header() {
  const hydrated = useHydrated();
  const cartCount = useTienda((s) => s.cart.reduce((a, c) => a + c.qty, 0));
  const wishCount = useTienda((s) => s.wish.length);
  const openCart = useTienda((s) => s.openCart);

  return (
    <header className="sticky top-0 z-60 border-b border-ink bg-paper">
      {/* Bajo 900px el rótulo pasa a su propia línea: en una sola fila los tres
          grupos se enciman. */}
      <div className="mx-auto flex max-w-[1480px] flex-col items-center gap-2 px-[clamp(16px,4vw,52px)] py-3 min-[900px]:grid min-[900px]:h-[58px] min-[900px]:grid-cols-[1fr_auto_1fr] min-[900px]:items-center min-[900px]:gap-4 min-[900px]:py-0">
        <Link
          href="/"
          className="order-1 text-[15px] leading-none font-medium tracking-[0.5em] whitespace-nowrap indent-[0.5em] min-[900px]:order-2"
        >
          BROKA
        </Link>

        <nav className="order-2 flex min-w-0 items-center gap-[22px] min-[900px]:order-1">
          <Link href="/" className={linkCls}>
            Inicio
          </Link>
          <Link href="/catalogo" className={linkCls}>
            Catálogo
          </Link>
          <Link href="/#proceso" className={linkCls}>
            Proceso
          </Link>
        </nav>

        <div className="order-3 flex min-w-0 items-center justify-end gap-[18px]">
          <Link href="/catalogo" className={`${linkCls} hidden min-[900px]:inline`}>
            Buscar
          </Link>
          <Link href="/favoritos" className={linkCls}>
            Favoritos ({hydrated ? wishCount : 0})
          </Link>
          <button type="button" onClick={openCart} className={`${linkCls} cursor-pointer`}>
            Carrito ({hydrated ? cartCount : 0})
          </button>
        </div>
      </div>
    </header>
  );
}

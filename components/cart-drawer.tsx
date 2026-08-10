'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { ImageSlot } from '@/components/image-slot';
import { money } from '@/lib/format';
import { useTienda } from '@/lib/store';

export function CartDrawer() {
  const { cart, cartOpen, closeCart, inc, dec, remove } = useTienda();
  const count = cart.reduce((a, c) => a + c.qty, 0);
  const subtotal = cart.reduce((a, c) => a + c.unit * c.qty, 0);

  useEffect(() => {
    if (!cartOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [cartOpen, closeCart]);

  if (!cartOpen) return null;

  return (
    <div className="fixed inset-0 z-80 flex justify-end">
      <button
        type="button"
        aria-label="Cerrar carrito"
        onClick={closeCart}
        className="brk-fade absolute inset-0 cursor-default bg-[oklch(0.18_0.004_100/0.42)]"
      />
      <aside className="brk-slide relative flex h-full w-[min(430px,100%)] flex-col bg-paper shadow-[-1px_0_0_oklch(0.88_0.004_100)]">
        <div className="flex items-center justify-between border-b border-ink px-6 py-[22px]">
          <p className="text-[10px] tracking-[0.2em] uppercase">Carrito ({count})</p>
          <button
            type="button"
            onClick={closeCart}
            className="cursor-pointer text-[10px] tracking-[0.16em] text-n50 uppercase"
          >
            Cerrar
          </button>
        </div>

        {cart.length > 0 ? (
          <>
            <div className="flex flex-1 flex-col gap-[22px] overflow-y-auto p-6">
              {cart.map((i) => (
                <div key={i.key} className="flex items-start gap-[14px]">
                  <div className="h-[88px] w-[88px] flex-none bg-n93">
                    <ImageSlot id={`brk-p-${i.id}`} placeholder={i.ph} sizes="88px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[19px]">{i.n}</p>
                    <p className="mt-1 text-[11px] leading-[1.5] text-n53">
                      {i.finishName} · {i.sizeName} · {i.dimsLabel}
                    </p>
                    <div className="mt-[10px] flex items-center gap-[14px]">
                      <div className="flex items-center border border-ink">
                        <button
                          type="button"
                          onClick={() => dec(i.key)}
                          className="cursor-pointer px-[11px] py-[5px] text-[13px] leading-none text-n45"
                        >
                          −
                        </button>
                        <span className="min-w-5 px-1.5 text-center text-[12.5px]">{i.qty}</span>
                        <button
                          type="button"
                          onClick={() => inc(i.key)}
                          className="cursor-pointer px-[11px] py-[5px] text-[13px] leading-none text-n45"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(i.key)}
                        className="cursor-pointer text-[10px] tracking-[0.14em] text-n55 uppercase"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                  <span className="text-[12.5px] whitespace-nowrap">{money(i.unit * i.qty)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-ink px-6 py-[22px]">
              <div className="mb-1.5 flex items-baseline justify-between">
                <span className="text-[11px] tracking-[0.16em] uppercase">Subtotal</span>
                <span className="text-[27px]">{money(subtotal)}</span>
              </div>
              <p className="mb-4 text-[11px] leading-[1.55] text-n55">
                Los precios no incluyen IVA. El impuesto y el envío se calculan al pagar.
              </p>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="block bg-ink px-6 py-[17px] text-center text-[10.5px] tracking-[0.2em] text-white uppercase"
              >
                Proceder al pago
              </Link>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col justify-center p-6">
            <p className="mb-5 text-[25px] leading-[1.3] font-light text-n42">
              Tu carrito está vacío.
            </p>
            <Link
              href="/catalogo"
              onClick={closeCart}
              className="inline-block border border-ink px-[26px] py-[14px] text-center text-[10px] tracking-[0.19em] uppercase"
            >
              Ver catálogo
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}

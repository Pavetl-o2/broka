'use client';

import { useState } from 'react';

export function Newsletter() {
  const [subscribed, setSubscribed] = useState(false);

  return (
    <section className="bg-ink px-[clamp(16px,4vw,52px)] py-[clamp(52px,6.4vw,104px)] text-white">
      <h2 className="max-w-[16ch] text-[clamp(26px,4.4vw,64px)] leading-[1.02] font-normal tracking-[-0.036em] text-balance">
        Regístrate y obtén 10% en tu primer pedido
      </h2>

      <div className="mt-[clamp(26px,3.2vw,44px)] grid grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))] items-center gap-[clamp(20px,3vw,48px)]">
        <p className="max-w-[36ch] text-[13.5px] leading-[1.62] text-n76">
          Novedades de colección y piezas nuevas del taller. Un correo al mes, ni uno más.
        </p>

        <div>
          {subscribed ? (
            <div className="brk-fade-slow max-w-[480px] border-b border-white pb-4">
              <p className="mb-1.5 text-[15px]">Listo, ya estás dentro.</p>
              <p className="text-[12.5px] leading-[1.6] text-n76">
                Te enviamos el código{' '}
                <strong className="font-medium text-white">BIENVENIDA10</strong> a tu correo. Aplica
                en tu primer pedido.
              </p>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSubscribed(true);
              }}
              className="flex max-w-[480px] border-b border-white"
            >
              <input
                type="email"
                required
                placeholder="tu@correo.com"
                aria-label="Correo electrónico"
                className="min-w-0 flex-1 border-0 bg-transparent px-0.5 py-[14px] text-[15px] text-white outline-none placeholder:text-n76"
              />
              <button
                type="submit"
                className="cursor-pointer border-0 bg-transparent py-[14px] pr-0.5 pl-[18px] text-[9.5px] tracking-[0.18em] whitespace-nowrap text-white uppercase"
              >
                Suscribirme →
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { ImageSlot } from '@/components/image-slot';
import { money } from '@/lib/format';
import { ENVIO, ENVIO_GRATIS_DESDE, IVA } from '@/lib/parametric/precio';
import { useHydrated, useTienda } from '@/lib/store';

const input =
  'border border-ink bg-transparent px-4 py-[14px] text-[14px] outline-none';
const seccion = 'mb-[14px] text-[9.5px] tracking-[0.2em] text-n52 uppercase';

function Confirmado({ pedido }: { pedido: string }) {
  return (
    <div className="brk-fade-slow max-w-[52ch] py-[clamp(30px,5vw,70px)]">
      <p className="mb-4 text-[9.5px] tracking-[0.2em] uppercase">Pedido confirmado</p>
      <h1 className="mb-5 text-[clamp(32px,4.4vw,58px)] leading-[1.04] font-light tracking-[-0.038em]">
        Gracias. Tu pieza entra a corte.
      </h1>
      <p className="mb-3 text-[14px] leading-[1.7] text-n46">
        Te enviamos la confirmación al correo con el número de pedido{' '}
        <strong className="font-medium text-n24">{pedido}</strong>. En cuanto la hoja entre a la
        máquina te avisamos, y otra vez cuando salga a entrega.
      </p>
      <p className="mb-[30px] text-[13px] leading-[1.7] text-n52">
        Producción estimada: 4 a 6 semanas. Entrega plana, con instructivo y llave de ensamble.
      </p>
      <Link
        href="/"
        className="inline-block border border-ink px-7 py-[15px] text-[10px] tracking-[0.19em] uppercase"
      >
        Volver al inicio
      </Link>
    </div>
  );
}

function CheckoutInner() {
  const params = useSearchParams();
  const hydrated = useHydrated();
  const cart = useTienda((s) => s.cart);
  const clear = useTienda((s) => s.clear);

  const [ordered, setOrdered] = useState(false);
  const [pedido, setPedido] = useState('BRK-24817');
  const [pagando, setPagando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Stripe devuelve al cliente aquí tras cobrar.
  const vueltaDeStripe = params.get('pedido') === 'confirmado';
  useEffect(() => {
    if (!vueltaDeStripe) return;
    setPedido(`BRK-${Math.floor(10000 + Math.random() * 89999)}`);
    setOrdered(true);
    clear();
  }, [vueltaDeStripe, clear]);

  const subtotal = cart.reduce((a, c) => a + c.unit * c.qty, 0);
  const iva = Math.round(subtotal * IVA);
  const envio = subtotal >= ENVIO_GRATIS_DESDE || subtotal === 0 ? 0 : ENVIO;
  const total = subtotal + iva + envio;

  const pagar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setPagando(true);
    setError(null);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          lines: cart,
          datos: Object.fromEntries(form.entries()),
        }),
      });
      const data = (await res.json()) as { url?: string | null; error?: string };

      if (data.url) {
        window.location.assign(data.url);
        return;
      }
      if (data.error) {
        setError(data.error);
        return;
      }

      // Modo demo: sin llaves de Stripe el pedido se confirma aquí.
      setPedido(`BRK-${Math.floor(10000 + Math.random() * 89999)}`);
      setOrdered(true);
      clear();
      window.scrollTo(0, 0);
    } catch {
      setError('No pudimos contactar la pasarela de pago. Intenta de nuevo.');
    } finally {
      setPagando(false);
    }
  };

  if (ordered) return <Confirmado pedido={pedido} />;

  if (hydrated && cart.length === 0) {
    return (
      <div className="max-w-[44ch] py-[clamp(30px,5vw,70px)]">
        <h1 className="mb-5 text-[clamp(32px,4.4vw,58px)] leading-[1.02] font-light tracking-[-0.038em]">
          Tu carrito está vacío.
        </h1>
        <Link
          href="/catalogo"
          className="inline-block border border-ink px-[26px] py-[14px] text-[10px] tracking-[0.19em] uppercase"
        >
          Ver catálogo
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-[clamp(28px,3.4vw,46px)] text-[clamp(32px,4.4vw,58px)] leading-[1.02] font-light tracking-[-0.038em]">
        Finalizar compra
      </h1>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] items-start gap-[clamp(30px,4vw,68px)]">
        <form onSubmit={pagar}>
          <p className={seccion}>Contacto</p>
          <div className="mb-[30px] flex flex-col gap-[9px]">
            <input name="email" type="email" required placeholder="Correo electrónico" className={input} />
            <input
              name="telefono"
              type="tel"
              required
              placeholder="Teléfono (10 dígitos)"
              className={input}
            />
          </div>

          <p className={seccion}>Dirección de envío</p>
          <div className="mb-[30px] grid grid-cols-2 gap-[9px]">
            <input name="nombre" type="text" required placeholder="Nombre" className={input} />
            <input name="apellidos" type="text" required placeholder="Apellidos" className={input} />
            <input
              name="calle"
              type="text"
              required
              placeholder="Calle y número"
              className={`${input} col-span-2`}
            />
            <input name="colonia" type="text" placeholder="Colonia" className={input} />
            <input name="cp" type="text" required placeholder="Código postal" className={input} />
            <input name="ciudad" type="text" required placeholder="Ciudad" className={input} />
            <input name="estado" type="text" required placeholder="Estado" className={input} />
          </div>

          <p className={seccion}>Pago</p>
          <div className="mb-[14px] border border-ink p-4">
            <p className="text-[13px] leading-[1.7] text-n46">
              Al continuar te llevamos a la página segura de Stripe para capturar tu tarjeta. Nunca
              pasan por nuestros servidores los datos de pago.
            </p>
          </div>
          <p className="mb-[22px] text-[11px] leading-[1.6] text-n55">
            Pago seguro procesado por Stripe. No almacenamos datos de tu tarjeta. Aceptamos Visa,
            Mastercard, American Express y meses sin intereses desde $5,000 MXN.
          </p>

          {error && (
            <p className="mb-4 border-l-2 border-ink pl-3 text-[12px] leading-[1.6] text-n46">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={pagando}
            className="w-full cursor-pointer border-0 bg-ink px-6 py-[18px] text-[10.5px] tracking-[0.2em] text-white uppercase disabled:opacity-70"
          >
            {pagando ? 'Conectando con Stripe…' : `Pagar ${money(total)}`}
          </button>
        </form>

        <aside className="border border-ink p-[clamp(20px,2.4vw,30px)]">
          <p className="mb-[18px] text-[9.5px] tracking-[0.2em] text-n52 uppercase">Tu pedido</p>
          <div className="mb-[18px] flex flex-col gap-4 border-b border-n82 pb-[18px]">
            {cart.map((i) => (
              <div key={i.key} className="flex items-start gap-[14px]">
                <div className="h-16 w-16 flex-none bg-n93">
                  <ImageSlot id={`brk-p-${i.id}`} placeholder={i.ph} sizes="64px" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px]">{i.n}</p>
                  <p className="mt-[3px] text-[11px] leading-[1.5] text-n53">
                    {i.finishName} · {i.dimsLabel}
                    {i.qty > 1 ? ` · ×${i.qty}` : ''}
                  </p>
                </div>
                <span className="text-[12.5px] whitespace-nowrap">{money(i.unit * i.qty)}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-[9px] text-[13px] text-n42">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{money(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>IVA (16%)</span>
              <span>{money(iva)}</span>
            </div>
            <div className="flex justify-between">
              <span>Envío</span>
              <span>{envio === 0 ? 'Incluido' : money(envio)}</span>
            </div>
          </div>

          <div className="mt-4 flex items-baseline justify-between border-t border-ink pt-4">
            <span className="text-[11px] tracking-[0.16em] uppercase">Total</span>
            <span className="text-[30px] font-normal">{money(total)}</span>
          </div>

          <p className="mt-4 text-[11px] leading-[1.6] text-n55">
            Fabricación bajo pedido. Al confirmar, el despiece entra a la fila de corte y la
            producción tarda de 4 a 6 semanas.
          </p>
        </aside>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <main className="brk-fade mx-auto min-h-[70vh] max-w-[1240px] px-[clamp(16px,4vw,52px)] pt-[clamp(34px,4.6vw,64px)] pb-[clamp(60px,7vw,100px)]">
      <Suspense>
        <CheckoutInner />
      </Suspense>
    </main>
  );
}

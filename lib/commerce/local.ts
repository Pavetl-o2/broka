import 'server-only';

import Stripe from 'stripe';
import type { Cotizacion, DatosPedido, Filtros } from '@/lib/commerce';
import { getProduct as findProduct, PRODUCTS } from '@/lib/data/products';
import { cost, precioDe, ENVIO, ENVIO_GRATIS_DESDE, IVA } from '@/lib/parametric/precio';
import type { CartLine, Producto } from '@/lib/types';

/**
 * Implementación de desarrollo y demo: los productos salen de `data/products.json`
 * y el precio lo calcula el motor paramétrico. Es la que corre hoy en Vercel.
 */

export async function listProducts(f: Filtros = {}): Promise<Producto[]> {
  let list = PRODUCTS.slice();
  if (f.categoria && f.categoria !== 'Todo') list = list.filter((x) => x.category === f.categoria);
  if (f.material && f.material !== 'Todo') list = list.filter((x) => x.materialES === f.material);
  if (f.precio && f.precio !== 'Todo') {
    list = list.filter((x) => {
      const v = precioDe(x);
      if (f.precio === 'Hasta $8,000') return v <= 8000;
      if (f.precio === '$8,000 – $16,000') return v > 8000 && v <= 16000;
      return v > 16000;
    });
  }
  if (f.orden === 'Precio ascendente') list.sort((a, b) => precioDe(a) - precioDe(b));
  if (f.orden === 'Precio descendente') list.sort((a, b) => precioDe(b) - precioDe(a));
  return list;
}

export async function getProduct(id: string): Promise<Producto | undefined> {
  return findProduct(id);
}

/**
 * Recalcula cada línea desde el catálogo y el motor de precio. El importe que
 * mandó el navegador se descarta: el precio es una función de las medidas y esa
 * función corre aquí.
 */
export async function quoteLines(lines: CartLine[]) {
  const validas: CartLine[] = [];

  for (const l of lines) {
    const p = findProduct(l.id);
    if (!p) continue;
    if (!p.finishes.includes(l.finish)) continue;

    const qty = Math.max(1, Math.min(99, Math.floor(l.qty)));
    const unit = cost(p, l.finish).total;
    validas.push({ ...l, n: p.nameES, unit, qty });
  }

  const subtotal = validas.reduce((a, c) => a + c.unit * c.qty, 0);
  const iva = Math.round(subtotal * IVA);
  const envio = subtotal >= ENVIO_GRATIS_DESDE || subtotal === 0 ? 0 : ENVIO;

  return { lines: validas, subtotal, iva, envio, total: subtotal + iva + envio };
}

export async function createCheckoutSession(
  lines: CartLine[],
  origin: string,
  datos: DatosPedido,
) {
  const key = process.env.STRIPE_SECRET_KEY;
  // Sin llaves el sitio sigue funcionando en modo demo: el checkout confirma
  // el pedido en el navegador en lugar de cobrar.
  if (!key) return { url: null };

  const { lines: validas, iva, envio } = await quoteLines(lines);
  if (validas.length === 0) return { url: null };

  const stripe = new Stripe(key);

  const items: Stripe.Checkout.SessionCreateParams.LineItem[] = validas.map((l) => ({
    quantity: l.qty,
    price_data: {
      currency: 'mxn',
      unit_amount: l.unit * 100,
      product_data: {
        name: l.n,
        description: `${l.finishName} · ${l.dimsLabel}`,
      },
    },
  }));

  items.push({
    quantity: 1,
    price_data: {
      currency: 'mxn',
      unit_amount: iva * 100,
      product_data: { name: 'IVA (16%)' },
    },
  });

  if (envio > 0) {
    items.push({
      quantity: 1,
      price_data: {
        currency: 'mxn',
        unit_amount: envio * 100,
        product_data: { name: 'Envío nacional' },
      },
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: items,
    locale: 'es',
    customer_email: datos.email,
    success_url: `${origin}/checkout?pedido=confirmado`,
    cancel_url: `${origin}/checkout`,
    // El webhook lee esto para generar el despiece y abrir la orden de producción.
    metadata: {
      despiece: JSON.stringify(
        validas.map((l) => ({ id: l.id, finish: l.finish, qty: l.qty })),
      ),
      envio: `${datos.nombre} ${datos.apellidos} · ${datos.calle}, ${datos.colonia}, ${datos.cp} ${datos.ciudad}, ${datos.estado} · tel ${datos.telefono}`.slice(
        0,
        500,
      ),
    },
  });

  return { url: session.url };
}

export async function requestQuote(payload: Cotizacion) {
  const apiKey = process.env.RESEND_API_KEY;
  const destino = process.env.COTIZACIONES_EMAIL;

  const cuerpo = [
    `Producto: ${payload.producto}`,
    `Acabado: ${payload.acabado}`,
    `Medidas: ${payload.medidas}`,
    `Estimado del configurador: $${payload.estimado} MXN sin IVA`,
    '',
    `Nombre: ${payload.nombre}`,
    `Correo: ${payload.email}`,
    `Mensaje: ${payload.mensaje || '—'}`,
  ].join('\n');

  if (!apiKey || !destino) {
    console.info('[cotización]\n%s', cuerpo);
    return;
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      from: 'Broka <cotizaciones@broka.mx>',
      to: [destino],
      reply_to: payload.email,
      subject: `Cotización · ${payload.producto} · ${payload.medidas}`,
      text: cuerpo,
    }),
  });

  if (!res.ok) throw new Error(`Resend respondió ${res.status}`);
}

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { abrirOrdenDeProduccion, type LineaPedido } from '@/lib/produccion';

export async function POST(req: Request) {
  const key = process.env.STRIPE_SECRET_KEY;
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!key || !secret) {
    return NextResponse.json({ error: 'Stripe no está configurado' }, { status: 503 });
  }

  const firma = req.headers.get('stripe-signature');
  if (!firma) return NextResponse.json({ error: 'Falta la firma' }, { status: 400 });

  const raw = await req.text();
  const stripe = new Stripe(key);

  let evento: Stripe.Event;
  try {
    evento = await stripe.webhooks.constructEventAsync(raw, firma, secret);
  } catch {
    return NextResponse.json({ error: 'Firma inválida' }, { status: 400 });
  }

  if (evento.type === 'checkout.session.completed') {
    const session = evento.data.object;
    const despiece = session.metadata?.despiece;
    if (despiece) {
      const lineas = JSON.parse(despiece) as LineaPedido[];
      await abrirOrdenDeProduccion(session.id.slice(-8).toUpperCase(), lineas);
    }
  }

  return NextResponse.json({ received: true });
}

import { NextResponse } from 'next/server';
import { commerce, type DatosPedido } from '@/lib/commerce';
import type { CartLine } from '@/lib/types';

const CAMPOS: (keyof DatosPedido)[] = [
  'email',
  'telefono',
  'nombre',
  'apellidos',
  'calle',
  'colonia',
  'cp',
  'ciudad',
  'estado',
];

export async function POST(req: Request) {
  const body = (await req.json()) as { lines?: CartLine[]; datos?: Partial<DatosPedido> };
  const lines = Array.isArray(body.lines) ? body.lines : [];

  if (lines.length === 0) {
    return NextResponse.json({ error: 'Carrito vacío' }, { status: 400 });
  }

  const datos = Object.fromEntries(
    CAMPOS.map((k) => [k, String(body.datos?.[k] ?? '').slice(0, 200)]),
  ) as DatosPedido;

  const origin = new URL(req.url).origin;
  const { url } = await commerce.createCheckoutSession(lines, origin, datos);

  // url === null ⇒ no hay llaves de Stripe: el cliente confirma en modo demo.
  return NextResponse.json({ url });
}

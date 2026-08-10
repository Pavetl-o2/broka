import { NextResponse } from 'next/server';
import { commerce, type Cotizacion } from '@/lib/commerce';

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<Cotizacion>;

  if (!body.nombre || !body.email || !body.producto) {
    return NextResponse.json({ error: 'Faltan datos de la solicitud' }, { status: 400 });
  }

  await commerce.requestQuote({
    nombre: String(body.nombre).slice(0, 200),
    email: String(body.email).slice(0, 200),
    mensaje: body.mensaje ? String(body.mensaje).slice(0, 2000) : '',
    producto: String(body.producto).slice(0, 200),
    acabado: String(body.acabado ?? '').slice(0, 100),
    medidas: String(body.medidas ?? '').slice(0, 100),
    estimado: Number(body.estimado) || 0,
  });

  return NextResponse.json({ ok: true });
}

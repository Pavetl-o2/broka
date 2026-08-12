import 'server-only';

import { getProduct } from '@/lib/data/products';
import { despieceDXF } from '@/lib/parametric/dxf';
import type { FinishKey } from '@/lib/types';

export type LineaPedido = { id: string; finish: FinishKey; size: string; qty: number };

/**
 * Orden de producción. Se dispara al confirmarse el pago, nunca en el navegador:
 * el despiece es interno y el cliente no lo ve.
 */
export async function abrirOrdenDeProduccion(pedido: string, lineas: LineaPedido[]) {
  const adjuntos = lineas.flatMap((l) => {
    const p = getProduct(l.id);
    if (!p) return [];
    const etiqueta = `${pedido} · ${p.nameES} · ${l.finish}`;
    return [
      {
        filename: `${pedido}-${p.id}.dxf`,
        content: Buffer.from(
          despieceDXF(p.type, etiqueta),
          'utf8',
        ).toString('base64'),
        piezas: `${p.nameES} × ${l.qty}`,
      },
    ];
  });

  const apiKey = process.env.RESEND_API_KEY;
  const destino = process.env.COTIZACIONES_EMAIL;

  if (!apiKey || !destino) {
    console.info(
      '[producción] pedido %s · %d archivos de corte: %s',
      pedido,
      adjuntos.length,
      adjuntos.map((a) => a.filename).join(', '),
    );
    return;
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      from: 'Broka <produccion@broka.mx>',
      to: [destino],
      subject: `Corte · pedido ${pedido}`,
      text: adjuntos.map((a) => `${a.piezas} → ${a.filename}`).join('\n'),
      attachments: adjuntos.map(({ filename, content }) => ({ filename, content })),
    }),
  });

  if (!res.ok) throw new Error(`Resend respondió ${res.status}`);
}

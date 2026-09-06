import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Ficha } from '@/components/ficha';
import { ImageSlot } from '@/components/image-slot';
import { getProduct, PRODUCTS } from '@/lib/data/products';
import { money } from '@/lib/format';
import { precioDe } from '@/lib/parametric/precio';

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const p = getProduct(id);
  if (!p) return {};

  return {
    title: p.nameES,
    description: p.descriptionES,
    openGraph: {
      title: `${p.nameES} · Broka`,
      description: p.descriptionES,
      locale: 'es_MX',
      type: 'website',
    },
  };
}

export default async function ProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = getProduct(id);
  if (!p) notFound();

  const related = PRODUCTS.filter((x) => x.id !== p.id).slice(0, 3);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.nameES,
    description: p.descriptionES,
    category: p.category,
    material: p.materialES,
    brand: { '@type': 'Brand', name: 'Broka' },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'MXN',
      lowPrice: precioDe(p),
      availability: 'https://schema.org/PreOrder',
    },
  };

  return (
    <main className="brk-fade">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-[1480px] px-[clamp(16px,4vw,52px)] pt-[18px] text-[10.5px] tracking-[0.1em] text-n55 uppercase">
        <Link href="/catalogo">Catálogo</Link> · {p.category} ·{' '}
        <span className="text-n30">{p.nameES}</span>
      </div>

      <div className="mx-auto max-w-[1480px] px-[clamp(16px,4vw,52px)] pt-[clamp(26px,3.4vw,48px)] pb-[clamp(22px,2.6vw,36px)]">
        <h1 className="max-w-[14ch] text-[clamp(38px,7.4vw,116px)] leading-[0.92] font-normal tracking-[-0.045em] text-balance">
          {p.nameES}
        </h1>
        <div className="mt-[clamp(22px,3vw,40px)] grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-[clamp(16px,3vw,48px)] border-t border-ink pt-[18px]">
          <p className="text-[10px] tracking-[0.16em] uppercase">
            {p.category}
            <br />
            {p.materialES}
          </p>
          <p className="col-span-2 max-w-[42ch] text-[14px] leading-[1.6] text-pretty">
            {p.descriptionES}
          </p>
          <p className="text-[10px] tracking-[0.16em] uppercase">
            Tol. ±0.1 mm
            <br />
            Tablero 18 mm
          </p>
        </div>
      </div>

      <Ficha producto={p} />

      <section className="mx-auto max-w-[1480px] border-t border-ink px-[clamp(16px,4vw,52px)] py-[clamp(46px,6vw,84px)]">
        <h2 className="mb-[clamp(24px,3vw,40px)] text-[clamp(26px,3.4vw,44px)] font-light tracking-[-0.032em]">
          También te puede interesar
        </h2>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-[clamp(20px,2.4vw,36px)]">
          {related.map((r) => (
            <article key={r.id}>
              <Link href={`/producto/${r.id}`} className="block aspect-square bg-n93">
                <ImageSlot
                  id={`brk-p-${r.id}`}
                  placeholder={r.images[0]}
                  sizes="(max-width: 768px) 100vw, 25vw"
                />
              </Link>
              <div className="mt-3 flex items-baseline justify-between gap-3">
                <h3 className="text-[20px] font-normal">
                  <Link href={`/producto/${r.id}`}>{r.nameES}</Link>
                </h3>
                <span className="text-[11.5px] whitespace-nowrap text-n45">
                  {money(precioDe(r))}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

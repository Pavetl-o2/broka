import type { Metadata } from 'next';
import Link from 'next/link';
import { ProductCardGrid } from '@/components/product-card';
import { commerce } from '@/lib/commerce';
import { CATEGORIAS } from '@/lib/data/products';

export const metadata: Metadata = {
  title: 'Catálogo',
  description:
    'Seis piezas de mobiliario CNC, configurables en medida y acabado. Sillas, mesas, libreros, bancos, escritorios y casegoods.',
};

const MATERIALES = ['Todo', 'Contrachapado de abedul', 'MDF de fibra fina'];
const PRECIOS = ['Todo', 'Hasta $8,000', '$8,000 – $16,000', 'Más de $16,000'];
const ORDENES = ['Destacados', 'Precio ascendente', 'Precio descendente'];

type Filtros = { categoria: string; material: string; precio: string; orden: string };

function Chip({
  label,
  activo,
  href,
}: {
  label: string;
  activo: boolean;
  href: string;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      className={`border px-[14px] py-2 text-[10.5px] tracking-[0.1em] uppercase ${
        activo ? 'border-ink bg-ink text-white' : 'border-ink bg-transparent text-n35'
      }`}
    >
      {label}
    </Link>
  );
}

function Grupo({
  titulo,
  opciones,
  activo,
  clave,
  filtros,
}: {
  titulo: string;
  opciones: string[];
  activo: string;
  clave: keyof Filtros;
  filtros: Filtros;
}) {
  const hrefDe = (valor: string) => {
    const next = { ...filtros, [clave]: valor };
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(next)) {
      if (v !== 'Todo' && v !== 'Destacados') qs.set(k, v);
    }
    const s = qs.toString();
    return s ? `/catalogo?${s}` : '/catalogo';
  };

  return (
    <div className="min-w-0">
      <p className="mb-[11px] text-[9.5px] tracking-[0.18em] text-n52 uppercase">{titulo}</p>
      <div className="flex flex-wrap gap-[7px]">
        {opciones.map((o) => (
          <Chip key={o} label={o} activo={o === activo} href={hrefDe(o)} />
        ))}
      </div>
    </div>
  );
}

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const one = (v: string | string[] | undefined, fallback: string) =>
    typeof v === 'string' ? v : fallback;

  const filtros: Filtros = {
    categoria: one(sp.categoria, 'Todo'),
    material: one(sp.material, 'Todo'),
    precio: one(sp.precio, 'Todo'),
    orden: one(sp.orden, 'Destacados'),
  };

  const list = await commerce.listProducts(filtros);

  return (
    <main className="brk-fade mx-auto max-w-[1480px] px-[clamp(16px,4vw,52px)] pt-[clamp(34px,4.6vw,64px)] pb-[clamp(60px,7vw,100px)]">
      <p className="mb-3 text-[9.5px] tracking-[0.2em] text-n50 uppercase">Catálogo</p>
      <h1 className="mb-1.5 text-[clamp(34px,5vw,68px)] leading-[1.02] font-light tracking-[-0.038em]">
        Toda la colección
      </h1>
      <p className="mb-[clamp(28px,3.4vw,46px)] text-[13.5px] text-n50">
        {list.length === 1 ? '1 pieza' : `${list.length} piezas`}
      </p>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-[clamp(26px,3vw,46px)]">
        <div className="flex flex-wrap gap-[clamp(22px,3vw,48px)] border-t border-b border-ink py-5">
          <Grupo
            titulo="Categoría"
            opciones={['Todo', ...CATEGORIAS]}
            activo={filtros.categoria}
            clave="categoria"
            filtros={filtros}
          />
          <Grupo
            titulo="Material"
            opciones={MATERIALES}
            activo={filtros.material}
            clave="material"
            filtros={filtros}
          />
          <Grupo
            titulo="Precio"
            opciones={PRECIOS}
            activo={filtros.precio}
            clave="precio"
            filtros={filtros}
          />
          <div className="ml-auto">
            <Grupo
              titulo="Ordenar"
              opciones={ORDENES}
              activo={filtros.orden}
              clave="orden"
              filtros={filtros}
            />
          </div>
        </div>

        {list.length > 0 ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(292px,1fr))] gap-[clamp(22px,2.6vw,40px)]">
            {list.map((p) => (
              <ProductCardGrid key={p.id} p={p} />
            ))}
          </div>
        ) : (
          <p className="my-10 text-[26px] font-light text-n50">
            Ninguna pieza coincide con esos filtros.
          </p>
        )}
      </div>
    </main>
  );
}

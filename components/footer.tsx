import Link from 'next/link';
import { CATEGORIAS } from '@/lib/data/products';

const colTitle = 'mb-4 text-[9.5px] tracking-[0.2em] text-n50 uppercase';

export function Footer() {
  return (
    <footer className="border-t border-ink">
      <div className="mx-auto grid max-w-[1480px] grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-[clamp(28px,3.4vw,52px)] px-[clamp(16px,4vw,52px)] pt-[clamp(46px,6vw,80px)] pb-[30px]">
        <div>
          <p className="mb-[18px] text-[13px] font-medium tracking-[0.5em] indent-[0.5em]">BROKA</p>
          <p className="max-w-[30ch] text-[12.5px] leading-[1.7] text-n50">
            Taller de mobiliario de control numérico. Av. Chapultepec 340, Guadalajara, Jalisco.
          </p>
        </div>

        <div>
          <p className={colTitle}>Tienda</p>
          <div className="flex flex-col gap-[9px] text-[13px]">
            {CATEGORIAS.map((c) => (
              <Link key={c} href={`/catalogo?categoria=${encodeURIComponent(c)}`}>
                {c}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className={colTitle}>Información</p>
          <div className="flex flex-col gap-[9px] text-[13px]">
            <Link href="/#proceso">Proceso</Link>
            <Link href="/#proceso">Materiales y acabados</Link>
            <Link href="/#proceso">Envíos y entregas</Link>
            <Link href="/#proceso">Cuidado y garantía</Link>
            <Link href="/#proceso">Contacto</Link>
          </div>
        </div>

        <div>
          <p className={colTitle}>Materiales</p>
          <div className="flex flex-col gap-[9px] text-[12.5px] leading-[1.45] text-n50">
            <span>Contrachapado de abedul báltico, 18 mm</span>
            <span>MDF de fibra fina, 18 mm</span>
            <span>Acabados al agua, bajo VOC</span>
            <span>Cantos vistos sellados a mano</span>
          </div>
        </div>

        <div>
          <p className={colTitle}>Entrega</p>
          <p className="max-w-[28ch] text-[12.5px] leading-[1.7] text-n50">
            Cada pieza se corta al recibir el pedido. Producción de 4 a 6 semanas y entrega plana,
            con instructivo y llave de ensamble.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1480px] px-[clamp(16px,4vw,52px)] pb-9">
        <div className="flex flex-wrap justify-between gap-[14px] border-t border-n82 pt-5 text-[10.5px] tracking-[0.08em] text-n56">
          <span>© 2026 Broka · Guadalajara, México</span>
          <span>Precios en pesos mexicanos. No incluyen IVA.</span>
        </div>
      </div>
    </footer>
  );
}

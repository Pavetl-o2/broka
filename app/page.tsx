import Link from 'next/link';
import { ImageSlot } from '@/components/image-slot';
import { Newsletter } from '@/components/newsletter';
import { ProductCardHome } from '@/components/product-card';
import { PRODUCTS } from '@/lib/data/products';

const PILARES = [
  {
    no: '01 · Diseño',
    t: 'Diseño elevado',
    slot: 'brk-vp-1',
    ph: 'Detalle de espiga pasante enrasada en el costado, macro horizontal',
    b: 'La espiga cruza el costado y queda enrasada con la cara: sin tornillos, sin tarugos, sin herrajes. Cada mueble sale de un archivo probado en taller, y ése es el que entra a la máquina.',
  },
  {
    no: '02 · Precisión',
    t: 'Precisión CNC',
    slot: 'brk-vp-2',
    ph: 'Router CNC cortando tablero, viruta en el aire, horizontal',
    b: 'Tolerancia de 0.1 mm en cada trayectoria. Las uniones entran a presión, se alinean solas y sostienen la estructura sin holgura después de años de uso.',
  },
  {
    no: '03 · Materia',
    t: 'Materiales honestos',
    slot: 'brk-vp-3',
    ph: 'Cantos de contrachapado apilados, textura de capas, horizontal',
    b: 'Contrachapado de abedul con acabados al agua. Dejamos el canto a la vista: la capa es el ornamento, no hay chapa que finja madera maciza.',
  },
];

const LIFESTYLE = [
  {
    slot: 'brk-life-1',
    ph: 'Mesa LLANO en una terraza sobre la laguna, vertical',
    cap: 'Mesa LLANO en una terraza sobre la laguna de Bacalar.',
  },
  {
    slot: 'brk-life-2',
    ph: 'Librero RETÍCULA en un loft industrial, vertical',
    cap: 'Librero RETÍCULA en un loft industrial, contra el ventanal.',
  },
  {
    slot: 'brk-life-3',
    ph: 'Banco TRAMO en un muelle de madera, vertical',
    cap: 'Banco TRAMO en un muelle de Bacalar, al caer la tarde.',
  },
  {
    slot: 'brk-life-4',
    ph: 'Silla CRESTA junto a un ventanal industrial, vertical',
    cap: 'Silla CRESTA junto al ventanal, a media tarde.',
  },
  {
    slot: 'brk-life-5',
    ph: 'Mesa LLANO y Silla CRESTA en la terraza, vertical',
    cap: 'Mesa LLANO y Silla CRESTA en la terraza, a media tarde.',
  },
];

const PASOS = [
  {
    no: '01',
    t: 'El archivo, probado en taller',
    b: 'Cada mueble se dibujó, se cortó y se armó hasta que la unión entraba a presión. Ese archivo es el que ves girar en 3D y el que entra a la máquina: no hay una versión de catálogo y otra de producción.',
  },
  {
    no: '02',
    t: 'Una medida por mueble',
    b: 'La que quedó en ese archivo. No hay tallas ni medidas especiales: cambiar el tamaño cambiaría los esfuerzos de cada unión, y eso no se corrige estirando un dibujo.',
  },
  {
    no: '03',
    t: 'Corte al recibir el pedido',
    b: 'No hay bodega. Eliges acabado, se rutea la hoja y sale en piezas numeradas, con las cajas y espigas ya cortadas, a 0.1 mm de tolerancia.',
  },
  {
    no: '04',
    t: 'Acabado y envío',
    b: 'Lijado y sellado a mano, empaque plano, instructivo y llave de ensamble incluidos.',
  },
];

export default function HomePage() {
  return (
    <main>
      <section className="px-[clamp(16px,4vw,52px)] pt-[clamp(46px,7vw,110px)] pb-[clamp(34px,4.4vw,64px)]">
        <h1 className="max-w-[13ch] text-[clamp(38px,8.6vw,142px)] leading-[0.9] font-normal tracking-[-0.045em] text-balance">
          Mobiliario cortado al milímetro
        </h1>
        <div className="mt-[clamp(30px,4vw,58px)] grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-[clamp(18px,3vw,48px)] border-t border-ink pt-5">
          <p className="text-[10px] tracking-[0.16em] uppercase">
            Control numérico
            <br />
            Guadalajara, México
          </p>
          <p className="col-span-2 max-w-[34ch] text-[14px] leading-[1.55]">
            Panel de ingeniería, ruteado con tolerancia de 0.1 mm y ensamblado sin tornillos a la
            vista. Cada pieza se corta al recibir el pedido.
          </p>
          <div className="flex flex-wrap items-start gap-2">
            <Link
              href="/catalogo"
              className="bg-ink px-6 py-[13px] text-[9.5px] tracking-[0.18em] text-white uppercase"
            >
              Ver catálogo
            </Link>
            <Link
              href="#proceso"
              className="border border-ink px-6 py-[13px] text-[9.5px] tracking-[0.18em] uppercase transition-colors duration-200 hover:bg-ink hover:text-white"
            >
              Cómo se fabrica
            </Link>
          </div>
        </div>
      </section>

      <section className="px-[clamp(16px,4vw,52px)]">
        <div className="h-[min(66vh,620px)] min-h-[300px] bg-n93">
          <ImageSlot
            id="brk-hero"
            placeholder="Foto principal · comedor con Mesa LLANO, luz natural, horizontal"
            sizes="100vw"
            priority
          />
        </div>
      </section>

      <section className="px-[clamp(16px,4vw,52px)] pt-[clamp(48px,6.4vw,104px)] pb-[clamp(30px,4vw,56px)]">
        <p className="max-w-[22ch] text-[clamp(22px,3.4vw,50px)] leading-[1.14] font-normal tracking-[-0.032em] text-pretty">
          No fabricamos en serie. Cortamos cada pieza desde su archivo, una por pedido.
        </p>
      </section>

      <section className="px-[clamp(16px,4vw,52px)] pb-[clamp(48px,6vw,92px)]">
        {PILARES.map((v) => (
          <article
            key={v.no}
            className="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] items-start gap-[clamp(18px,3vw,48px)] border-t border-ink py-[clamp(20px,2.6vw,34px)]"
          >
            <p className="text-[10px] tracking-[0.16em] uppercase">{v.no}</p>
            <h3 className="max-w-[14ch] text-[clamp(20px,2.2vw,30px)] font-normal tracking-[-0.026em]">
              {v.t}
            </h3>
            <p className="col-span-2 max-w-[42ch] text-[13.5px] leading-[1.62] text-pretty">{v.b}</p>
            <div className="aspect-[3/2] bg-n93">
              <ImageSlot
                id={v.slot}
                placeholder={v.ph}
                sizes="(max-width: 768px) 65vw, (max-width: 1200px) 30vw, 20vw"
              />
            </div>
          </article>
        ))}
        <div className="border-t border-ink" />
      </section>

      <section className="px-[clamp(16px,4vw,52px)] pb-[clamp(48px,6vw,92px)]">
        <div className="mb-[clamp(20px,2.6vw,34px)] flex flex-wrap items-baseline justify-between gap-4">
          <h2 className="text-[clamp(24px,3.4vw,46px)] font-normal tracking-[-0.032em]">
            Colección
          </h2>
          <Link href="/catalogo" className="text-[10px] tracking-[0.16em] uppercase">
            Cuatro piezas · cuatro acabados
          </Link>
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-[clamp(20px,2.4vw,38px)]">
          {PRODUCTS.map((p) => (
            <ProductCardHome key={p.id} p={p} />
          ))}
        </div>
      </section>

      <section className="pb-[clamp(48px,6vw,92px)]">
        <div className="mb-[clamp(20px,2.4vw,32px)] flex flex-wrap items-baseline justify-between gap-4 border-t border-ink px-[clamp(16px,4vw,52px)] pt-4">
          <h2 className="text-[clamp(24px,3.4vw,46px)] font-normal tracking-[-0.032em]">
            Nuestros productos en casa
          </h2>
          <p className="text-[10px] tracking-[0.16em] uppercase">Cinco escenas</p>
        </div>
        <div className="flex gap-[clamp(12px,1.6vw,22px)] overflow-x-auto px-[clamp(16px,4vw,52px)] pb-1.5">
          {LIFESTYLE.map((l) => (
            <figure key={l.slot} className="w-[clamp(240px,30vw,400px)] flex-none">
              <div className="aspect-[3/4] bg-n93">
                <ImageSlot
                  id={l.slot}
                  placeholder={l.ph}
                  sizes="(max-width: 800px) 240px, (max-width: 1333px) 30vw, 400px"
                />
              </div>
              <figcaption className="mt-2.5 text-[11.5px] leading-[1.5] text-n44">
                {l.cap}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section
        id="proceso"
        className="scroll-mt-[76px] px-[clamp(16px,4vw,52px)] pb-[clamp(48px,6vw,92px)]"
      >
        <div className="mb-[clamp(22px,2.8vw,38px)] border-t border-ink pt-4">
          <h2 className="text-[clamp(24px,3.4vw,46px)] font-normal tracking-[-0.032em]">
            Del archivo a tu casa
          </h2>
        </div>
        {PASOS.map((s) => (
          <div
            key={s.no}
            className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] items-baseline gap-[clamp(16px,2.6vw,44px)] border-t border-n82 py-[clamp(16px,2vw,26px)]"
          >
            <p className="text-[clamp(30px,4vw,58px)] leading-none font-light tracking-[-0.04em]">
              {s.no}
            </p>
            <h3 className="text-[17px] font-normal tracking-[-0.018em]">{s.t}</h3>
            <p className="col-span-2 max-w-[46ch] text-[13.5px] leading-[1.62] text-pretty">{s.b}</p>
          </div>
        ))}
        <div className="border-t border-ink pt-[clamp(28px,3.4vw,48px)]">
          <p className="max-w-[32ch] text-[clamp(18px,2.2vw,30px)] leading-[1.34] font-light tracking-[-0.024em] text-pretty">
            Sembramos un árbol por cada pieza que sale del taller, con programas de reforestación en
            Jalisco.
          </p>
        </div>
      </section>

      <Newsletter />
    </main>
  );
}

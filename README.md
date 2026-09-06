# Broka — mobiliario de contrachapado cortado en CNC

Tienda en Next.js con visor 3D del despiece. Cada mueble tiene **una sola
medida**, la del archivo de corte con el que se armó y se probó en taller, y de
esa misma lista de piezas salen el visor, el precio y el DXF de producción.

No se fabrica a la medida. El sitio no lo ofrece y el código no lo soporta: la
deformación que existía era un cambio de ejes, sin ningún criterio estructural
detrás, y se quitó. Añadir medidas libres exige antes valores admisibles del
tablero, ensayos de las uniones y los casos de carga de EN 12520 / EN 1728.

- **Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS 4 · React Three Fiber · Stripe
- **Idioma:** español de México (`es-MX`), precios en MXN sin IVA
- **Despliegue:** Vercel, sin configuración adicional

---

## Arrancar en local

```bash
npm install
npm run dev
```

Abre <http://localhost:3000>. No hace falta ninguna variable de entorno: sin
llaves de Stripe el sitio corre en **modo demo** y el checkout confirma el pedido
en el navegador en lugar de cobrar.

Para configurar llaves:

```bash
cp .env.example .env.local
```

| Variable | Para qué |
|---|---|
| `STRIPE_SECRET_KEY` | Cobro real. Con `sk_test_…` usa la tarjeta 4242 4242 4242 4242 |
| `STRIPE_WEBHOOK_SECRET` | Firma del webhook que dispara el despiece |
| `NEXT_PUBLIC_SITE_URL` | Solo si usas dominio propio; en Vercel se detecta sola |
| `RESEND_API_KEY` + `PRODUCCION_EMAIL` | Envío de las órdenes de producción con sus archivos de corte. Se sigue leyendo `COTIZACIONES_EMAIL` por compatibilidad |

Otros comandos:

```bash
npm run build      # build de producción
npm start          # sirve el build
npm run typecheck  # TypeScript sin emitir
```

---

## Cómo está armado

```
app/
  page.tsx                    Home
  catalogo/page.tsx           catálogo con filtros (por URL, compartible)
  producto/[id]/page.tsx      ficha de producto, prerenderizada por producto
  favoritos/  checkout/       favoritos y compra
  api/checkout/               crea la sesión de Stripe
  api/webhooks/stripe/        pago confirmado → orden de producción + DXF
components/
  ficha.tsx                   precio, acabados y medida única
  visor/                      canvas R3F, geometría paramétrica, encuadre
lib/
  parametric/partList.ts      ← la fuente de verdad
  parametric/precio.ts        TARIFA y motor de costo
  parametric/dxf.ts           anidado en hoja y despiece DXF
  commerce/                   interfaz de comercio + implementación local
data/products.json            los seis productos
```

### Una sola fuente de verdad

```
partList(type, W, D, H)
   ├── geometría 3D    → una malla por pieza, colocada en pos/eje
   ├── costo           → área de tablero, metros de ruteo, m² de acabado
   └── despiece DXF    → los mismos rectángulos, anidados en hoja
```

Por eso el visor y el precio no pueden contradecirse: si cambias `partList`,
cambian los tres a la vez.

### Motor de precio

```
hojas   = areaTotal / (2.44 × 1.22 × 0.82)   // 0.82 = aprovechamiento del anidado
costo   = hojas × precioHoja[material]
        + metrosRuteo × 18
        + m²Sellados × 220 × multiplicadorAcabado
        + herraje
precio  = redondear(costo × 1.9, 50)
```

> ⚠ **Las tarifas de `lib/parametric/precio.ts` no están verificadas.** Salen de la
> descripción del taller, no del repo `mueble-calc`. Cotéjalas antes de vender:
> es el punto de mayor riesgo del proyecto. Están todas juntas en la constante
> `TARIFA` para corregirlas de un jalón.

El precio nunca se confía al navegador: antes de cobrar, `lib/commerce/local.ts`
lo recalcula en el servidor a partir del producto, el acabado y la talla.

---

## Añadir un producto

Es añadir un objeto a `data/products.json`. El `type` elige qué `partList` genera
la geometría (`silla`, `mesa`, `librero`, `banco`, `escritorio`, `buro`), y las
medidas van en milímetros:

```jsonc
{
  "id": "nuevo",
  "type": "mesa",
  "nameES": "Mesa NUEVA",
  "category": "Mesas",
  "materialES": "Contrachapado de abedul",
  "panel": "abedul",          // precio de hoja: abedul | mdf
  "herraje": 340,             // MXN fijos
  "finishes": ["roble", "nogal"],
  "sizes": [{ "id": "160", "nameES": "Seis personas", "w": 1600, "d": 900, "h": 750 }],
  "rango": { "w": [1200, 2800], "d": [800, 1100], "h": [720, 780] },
  "descriptionES": "…",
  "images": ["descripción de la foto 1", "…", "…"]
}
```

---

## Poner tus fotos

Cada hueco del sitio busca un archivo en `public/img/<id>.jpg` (también `.png`,
`.webp`, `.avif`). Si no existe, se queda el marcador punteado con la descripción
de la foto que va ahí. Sueltas los archivos y vuelves a desplegar.

| id | dónde |
|---|---|
| `brk-hero` | hero del home |
| `brk-vp-1` … `brk-vp-3` | los tres bloques de valor |
| `brk-p-{id}` | ficha de producto en todas las rejillas |
| `brk-life-1` … `brk-life-5` | galería «Nuestros productos en casa» |
| `brk-g-{id}-{0..2}` | carrusel de la página de producto |

Los `{id}` son los del catálogo: `cresta`, `llano`, `reticula`, `tramo`,
`vertiente`, `nudo`. Por ejemplo `public/img/brk-p-llano.jpg` y
`public/img/brk-g-llano-0.jpg`.

Formatos: hero horizontal, bloques de valor 4:5, producto 1:1 sobre fondo neutro,
lifestyle libre.

---

## Poner tus modelos 3D

Hoy la geometría sale del archivo de corte de cada mueble, así que lo que ves en
el visor es lo que la máquina rutea. Un GLB dibujado a mano rompería esa
garantía, que es el argumento del sitio.

Si aun así quieres GLB, exporta uno por mueble y nómbralo `acabado` al material
para poder intercambiarlo por código. Escala en metros, origen en el centro de
la base, eje Y hacia arriba. El campo `model3d` ya existe en el modelo de datos.
Antes de hacerlo, ten presente que el DXF de producción se seguirá generando de
la lista de piezas, no del GLB: si los dos se separan, la foto miente.

Lo barato y honesto es lo de ahora: cambiar el material por texturas reales con
`useTexture` en `components/visor/mueble.tsx`, apuntando a
`/public/textures/abedul/{albedo,normal,roughness}.jpg`.

Si el visor falla, la ficha cae sola a la galería fotográfica.

---

## Despiece DXF

Interno: el cliente nunca lo ve. Se genera al confirmarse el pago, en
`app/api/webhooks/stripe/route.ts` → `lib/produccion.ts`, que anida las piezas en
hojas de 2440 × 1220 y emite un DXF por línea del pedido. Con `RESEND_API_KEY`
llegan al correo del taller; sin llave se registran en los logs.

Para probar el webhook en local:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## Cambiar de motor de comercio

Toda la UI habla con la interfaz `CommerceService` de `lib/commerce/index.ts` y
nunca con el motor directamente. Hoy corre `local.ts`, que lee `products.json` y
calcula el precio con el motor paramétrico.

Para pasar a **Medusa v2** —la recomendación del handoff, porque el precio *es*
una función de las medidas y debe decidirse en tu servidor— escribe
`lib/commerce/medusa.ts` con esa misma interfaz y cambia una línea:

```ts
export const commerce: CommerceService = medusa;
```

La UI no se toca.

---

## Desplegar en Vercel

1. Sube el repo a GitHub (ver `INSTRUCCIONES-REPO.md`).
2. En <https://vercel.com/new> importa el repositorio. Vercel detecta Next.js solo:
   no cambies build command ni output directory.
3. Si vas a cobrar, añade las variables de entorno en **Settings → Environment
   Variables** y vuelve a desplegar.
4. Para el webhook, apunta Stripe a `https://TU-DOMINIO/api/webhooks/stripe` con
   el evento `checkout.session.completed`, y guarda el secreto en
   `STRIPE_WEBHOOK_SECRET`.

---

## Pendientes antes de producción

1. Cotejar `TARIFA` contra `mueble-calc`.
2. El anidado asume 0.82 de aprovechamiento parejo; el real varía por producto.
3. Verificar el armado del librero contra un archivo de corte: es el único de
   los cuatro que no pasa por el solver, y su despiece no está probado.
4. Persistencia de pedidos: hoy el carrito vive en `localStorage` y el pedido en
   Stripe. No hay base de datos.

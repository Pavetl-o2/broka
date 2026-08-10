# Broka — mobiliario CNC a la medida

Tienda en Next.js con configurador paramétrico 3D. El mueble se genera por código
a partir de sus medidas, y de esa misma lista de piezas salen el visor, el precio
y el despiece de corte.

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
| `RESEND_API_KEY` + `COTIZACIONES_EMAIL` | Envío de cotizaciones y archivos de corte por correo |

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
  producto/[id]/page.tsx      ficha + configurador, prerenderizada por producto
  favoritos/  checkout/       favoritos y compra
  api/checkout/               crea la sesión de Stripe
  api/cotizacion/             solicitudes de medida especial
  api/webhooks/stripe/        pago confirmado → orden de producción + DXF
components/
  configurador.tsx            precio en vivo, acabados, tallas, medida especial
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

Hoy la geometría se genera en código, así que responde a las medidas al
milímetro. Un GLB fijo no hace eso. Dos caminos:

**Seguir paramétrico** (recomendado para medida especial). No toques `partList`;
cambia solo el material por texturas reales con `useTexture` en
`components/visor/mueble.tsx`, apuntando a
`/public/textures/roble/{albedo,normal,roughness}.jpg`.

**Usar tus GLB** (recomendado para tallas estándar). Exporta un GLB por talla, no
por producto:

```
public/models/
  mesa-llano-160.glb
  mesa-llano-200.glb
```

Cárgalos con `useGLTF(producto.model3d)`. Nombra `acabado` al material del GLB
para poder intercambiarlo por código. Escala en metros, origen en el centro de la
base, eje Y hacia arriba. El campo `model3d` ya existe en el modelo de datos.

Lo probablemente correcto es el híbrido: GLB en tallas estándar, geometría
paramétrica en cuanto el usuario entra a medida especial.

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
2. Definir los límites reales de medida especial por producto (`rango`); los
   actuales son estimados razonables, no restricciones de taller.
3. El anidado asume 0.82 de aprovechamiento parejo; el real varía por producto.
4. Fotografía y modelos.
5. Persistencia de pedidos: hoy el carrito vive en `localStorage` y el pedido en
   Stripe. No hay base de datos.

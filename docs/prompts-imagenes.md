# Prompts de imagen — Broka

Para **ChatGPT Images (GPT Image)** y **Nano Banana 2 (Gemini 3 Pro Image)**.
Los dos aceptan varias imágenes de referencia; los prompts están escritos para
eso: `IMAGEN 1` es el mueble, `IMAGEN 2` la locación.

Cada hueco de la app está aquí con su `id`, su proporción real —leída del
contenedor, no del texto— y el prompt para pegar.

---

## 0. Cómo alimentar las referencias

**Nano Banana 2** — subir las dos imágenes y pegar el prompt tal cual. Respeta
mejor la geometría del objeto de referencia. Es el que conviene para las tomas
en locación.

**ChatGPT Images** — subir las dos y pegar el prompt. Tiende a reinterpretar el
objeto: si redibuja el mueble, repetir agregando al final
`Do not redesign the object in IMAGE 1. Copy its silhouette line for line.`

**De dónde sale la IMAGEN 1.** Del visor 3D de la propia app, en el acabado que
pida cada toma: abrir la ficha del producto, apagar Cuadrícula y Girar, girar a
la vista que pide el prompt y capturar. Es geometría del DXF, así que lo que
salga en la foto es lo que el taller corta.

---

## 1. Bloque base

Va **al final** de cada prompt de locación. No repetirlo en los de estudio.

Está escrito contra el fallo real de la primera tanda: los modelos entregaron
un paisaje con un mueble diminuto adentro, porque eso fue lo que se les pidió.
Un catálogo de muebles recorta el paisaje sin piedad — mira cualquier ficha de
Vondom, Gandia Blasco o Tribù: el mueble llena el cuadro y el entorno queda
desenfocado y cortado.

```
FRAMING — This is a FURNITURE CATALOGUE photograph, not a landscape. The
PIECE is the subject and must fill roughly 60% of the frame. The location is
context, not content: it is allowed to be cropped, thrown out of focus, and
to run out of frame. Do not centre the horizon. Do not show the whole vista.
Do not shrink the piece to fit the scenery in — crop the scenery instead.

CAMERA — 85 mm lens on full frame. Camera 90 cm above the ground, about
2.5 m from the piece, tilted very slightly down. Telephoto compression: the
background reads flattened and pushed close. Aperture f/2.8 — the piece is
razor sharp front to back, the background dissolves into soft shapes, the far
horizon is a gentle blur. No wide angle, no fisheye, no deep focus.

COMPOSITION — Place the piece off-centre, on a third. Horizon high in the
frame or hidden behind the piece, never cutting through the middle. Leave the
foreground ground plane open and textured — it is the stage the piece stands
on.

LIGHT — Take the weather, the hour and the direction of the light from
IMAGE 2 and keep them exactly. Do not invent a different sky.

PALETTE — This is the rule that holds the whole set together. The LOCATION is
desaturated, cool and weathered: greyed timber, salt-bleached paint, dull
concrete, muted green, pale water, low-contrast sky. Pull its saturation
down. The PIECE is the opposite and the only exception: clean, warm, precise,
the one thing in the frame with fresh colour and a crisp edge. That contrast
— cool worn place, warm new object — IS the photograph. Never let the
location be more saturated than the piece.

INTEGRATION — The piece is physically present in the scene, not pasted on
top. It must show ALL of this:
· a dark contact shadow where each foot meets the ground — tight and dark at
  the point of contact, softening outward
· ambient occlusion in every inside corner, under the top, between parts
· the ground's own colour bouncing up onto the underside of the piece
· the SAME light direction as the background. If the sky behind is bright,
  the piece is in relative shade with a bright rim along its upper edges —
  never lit flatly from the camera
· if the ground is wet or polished, a soft vertical reflection of the piece
  in it
· the same atmospheric haze, grain and colour cast as the background

MATERIAL — Birch plywood, CNC cut. The panel FACES carry the finish. Every
cut EDGE shows the raw laminated core: a warm tan striped band, clearly
visible against the face colour, on every single part. Surface is real, not
CG: faint mill marks, slightly soft arrises, a little dust in the corners.

NON-NEGOTIABLE — Reproduce the object in IMAGE 1 exactly: same number of
parts, same proportions, same joints, same angles. Do not restyle it, do not
add or remove parts, do not add cushions or hardware.

OUTPUT — Photographic realism, full-frame camera look. Natural perspective.
No text, no watermark, no logos.
```

**Resolución.** 2K para todo, menos el hero, que va en 4K. `next/image` sirve
variantes recortadas a la pantalla de cada visitante, así que el peso del
original es problema del repo, no del que navega: el mayor `deviceSize` que
Next genera es 3840 px y ningún hueco salvo el hero lo pide. Con pantalla 2×:
el hero llega a 3840, la galería de producto a ~2300, las viñetas a ~1290 y
las lifestyle a ~800 (se pintan a 400 px CSS). Si el 4K sale al mismo costo,
pedirlo y bajarlo al recibirlo — el hero pasó de 5824×2880 / 6.6 MB a
3840×1899 / 0.38 MB sin pérdida visible. Lo que no sirve es subir el 4K crudo.

---

## 1b. Cómo trabajarlo

**Dos pasadas, siempre.** Los dos modelos corrigen mejor de lo que crean, y
el bloque INTEGRATION lo ignoran en la primera. Pasada 1: sacar la escena con
la geometría y el encuadre correctos, aunque el mueble parezca pegado.
Pasada 2: volver a meter ese resultado como única referencia y pedir sólo la
integración.

**Las cuatro señales de que está pegado**, en el orden en que aparecen: no
proyecta sombra sobre el suelo; está más claro que la escena, porque el
modelo lo ilumina como producto de estudio; no recibe el color del entorno; y
el fondo está desenfocado de más, como una lámina borrosa detrás de un
recorte, en vez de tener profundidad progresiva.

```
Keep the piece, its design, its position and the framing exactly as they are.
Change only how it sits in the scene.

EXPOSURE — The piece is lit like a studio product and is far brighter than
its surroundings. Bring it down into the same exposure as the background: no
white highlights, the same muted, cool, slightly desaturated values as the
ground and the vegetation. Under an overcast sky nothing is brighter than
the sky.

SHADOW — The piece casts no shadow and floats. Add the shadow it must cast:
a soft diffuse overcast shadow spreading away from it across the ground,
plus a small dark contact patch under each foot — tight and dark where it
meets the ground, softening outward. The ground's own texture and pattern
show through the shadow.

BOUNCE — Add the colour of the surroundings onto the piece: green from the
vegetation, or the ground's own tone, on the undersides, the inner faces and
the lower legs. Add ambient occlusion in every inside corner and wherever
two parts meet.

FOCUS — The background is blurred like a pasted backdrop. Reduce the blur so
it reads as real depth of field: the ground immediately around the feet is
nearly as sharp as the piece, and the blur increases gradually toward the
horizon.

TEXTURE — Match the plate: the same photographic grain, the same haze and
the same colour cast as the scene. The surface is real timber, not smooth CG.

It must look photographed there, not composited onto it.
```

**Si la locación pelea.** Las fotos de locación son vistas amplias tomadas de
lejos: no tienen primer plano que sostenga un teleobjetivo a 2.5 m. Cuando el
modelo insista en alejar el mueble, dejar de componer sobre la foto y usarla
sólo como referencia de estilo:

```
Use IMAGE 2 only as a reference for the PLACE and the LIGHT — the palette,
the vegetation, the water, the weather, the tiled terrace. Do not copy its
framing. Build a new, closer view of that same place around the piece.
```

---

## 1c. Bloque base de estudio

Para **todos los close-ups** y las tomas de ficha. El taller no funciona de
cerca: el banco astillado, el aserrín y la madera vieja compiten con el canto
del triplay, que es justo lo único que hay que mirar. De cerca la toma es de
producto — fondo blanco de estudio, luz envolvente, y la franja rayada del
corazón como único color de la foto.

```
BACKGROUND — Pure white seamless studio sweep. No horizon line, no visible
surface, no workshop, no bench, no floor texture, no props. The background
reads as clean white (240-255) and dissolves behind the subject.

LIGHT — One very large soft source high and slightly behind the piece, plus
a white bounce from the front. Wraparound light, almost shadowless: only a
faint cool-grey contact shadow and a soft gradient on the shaded face. No
hard shadow, no visible light shape, no colour cast.

SUBJECT — Fill the frame with the joint. It runs edge to edge and is cropped
by the frame; there is no room around it. The camera is a hand's width away.

CAMERA — 100 mm macro at 25-35 cm, f/4. Focus on the joint line itself; the
rest of the piece falls off into soft white within a few centimetres.

MATERIAL — Brand-new birch plywood, clean and unhandled. Router-cut edges:
crisp, with the small radius the bit leaves. No dust, no sawdust, no
fingerprints, no wear, no tools, no hands.

FACES — The panel faces are a smooth matte laminate in the finish colour:
flat and even, no wood grain showing through, no stucco or orange-peel
texture, no brush marks, a slight satin sheen only. The face colour stops
dead at the arris — the edges are never painted or tinted.

EDGES — Every exposed plywood edge in the frame is the SAME material: the
same ply count, the same tone, the same stripe rhythm — pale cream veneers
with slightly warmer tan glue lines, low contrast, light overall. This
applies equally to the end-grain of a tenon seen face-on and to a panel edge
seen from the side: they must read as cut from one sheet. Do not make one
edge darker, warmer, coarser or more contrasty than another. No dark
hardwood, no oak, no OSB, no dark glue lines, no MDF core.

COLOUR — Two colours only: the finish on the faces, and the tan striped core
on every edge. Background white or cool grey. Nothing else.

OUTPUT — Photographic realism, full-frame camera look. No text, no
watermark, no logos.
```

**La regla que ordena todo esto:** de lejos manda la locación, de cerca manda
el material. En cuanto la toma es macro, fuera el taller.

**Los dos fallos de material que se repiten.** Primero, la cara: si se pide
"abedul natural" el modelo dibuja una superficie rugosa tipo estuco, porque
intenta pintar veta sobre un laminado. Pedir un acabado de color —azul,
blanco, negro— resuelve el problema y además hace saltar el canto. Segundo,
los cantos: el modelo trata cada canto como una madera distinta y saca uno
claro de frente y otro oscuro de perfil. Por eso el bloque EDGES insiste en
que salieron de la misma hoja.

**Una sola cámara.** Los prompts de locación no llevan su propia distancia
focal: la pone el bloque base, 85 mm a f/2.8. Los objetivos cortos y los
diafragmas cerrados que traía la primera versión —28, 35, 40 mm, "sharp
throughout"— son exactamente la receta del paisaje con el mueble diminuto.
Si un hueco necesita otra cosa, se escribe como desviación de una línea
(la altura de cámara del banco, por ejemplo), no como una cámara nueva.

## 2. Portada

### `brk-hero` · 2:1 apaisado · Mesa LLANO, abedul natural

Referencias: render de la mesa + foto de la laguna al amanecer.

```
IMAGE 1 = a CNC-cut birch plywood square table. IMAGE 2 = a tiled terrace
overlooking a lagoon at dawn — use it for the PLACE and the LIGHT.

Photograph the table from IMAGE 1 close up on that wet tiled terrace, seen
from the front-left at three-quarters, the camera low and near. The table
fills the left two thirds of the frame and its left edge runs OUT of the
frame — do not fit the whole table in. Its top edge sits above the horizon
line, so the table reads against water and sky, not against the floor. The
lagoon and the cloud break are a soft, out-of-focus band across the top
quarter only. A single ceramic cup on the table, nothing else.

The table is 116 × 116 cm and 73 cm tall — the camera is below its top, so we
see the underside of the overhang and the crossing of the legs.

Finish: natural birch, warm pale wood, cool grey light on it.

Wide 2:1 crop.

[BLOQUE BASE]
```

> Lo que cambió respecto al primer intento: la mesa pasa de ~12 % a ~60 % del
> cuadro y se sale por un lado, la cámara baja de 1.6 m a 90 cm, el lente sube
> de 35 a 85 mm, el fondo pasa de nítido a desenfocado, y la laguna deja de
> ocupar dos tercios para quedarse en un cuarto. La foto es de la mesa, no del
> lago.

### `brk-vp-1` · 3:2 apaisado · macro de unión

Sin locación: estudio. Referencia, sólo el render de la silla.

La unión real, medida en `armado-cnc.json`: la espiga del asiento sale 18 mm
del hombro y el costado tiene 18 mm de espesor, así que **cruza el costado y
queda enrasada con la cara de afuera**. No sobresale y **no hay cuña**. Lo que
se ve desde fuera es un rectángulo de canto rayado, del tamaño de la espiga,
metido a ras en la cara del costado, con la línea fina de la junta alrededor.

```
IMAGE 1 = a CNC-cut birch plywood chair.

Extreme close-up of a through-tenon joint on the chair from IMAGE 1, shot on
a pure white studio sweep.

THE JOINT — A 65 x 18 mm rectangular tenon passes right through an 18 mm
plywood side panel and stops dead flush with its outer face. From this side
you see: the flat finished face of the panel, and set into it a rectangle of
striped plywood end-grain — the end of the tenon — sitting perfectly level
with the surface, ringed by the hairline gap of the joint. Nothing sticks
out. There is no wedge, no peg, no screw, no dowel, no visible hardware.

FRAMING — Horizontal 3:2, landscape, clearly wider than tall. The joint
fills the frame and is cropped by it: the rectangle of
striped end-grain sits just off centre, the panel runs edge to edge, and the
board it locks recedes to one side and out of focus. Camera a hand's width
away, angled about 20 degrees off the panel face so the flushness reads.

BACKGROUND — Pure white seamless studio sweep, dissolving behind the piece.
No workshop, no bench, no sawdust, no props, no floor.

LIGHT — One very large soft source high and slightly behind, white bounce
from the front. Wraparound and almost shadowless, just a faint cool-grey
gradient and the thin shadow line inside the joint gap. No hard shadow, no
colour cast.

CAMERA — 100 mm macro at 30 cm, f/4. Sharp on the tenon end-grain; the panel
falls off into soft white.

FACES — All panel faces are matte navy laminate, very dark: midnight navy
ink, much closer to black than to blue. The typical face reads #081C34, the
planes turned away go down to #041830 and #000C1C, and only the one plane
facing the light reaches #2C4868. Not slate blue, not petrol, not denim, not
royal blue — dark navy. Smooth and perfectly even: no wood grain showing
through, no stucco or orange-peel texture, no brush marks, a slight satin
sheen only. The navy stops dead at the arris; no edge is ever painted.

EDGES — Every exposed plywood edge in the frame is cut from the same sheet
and must read that way: same ply count, same tone, same stripe rhythm — pale
cream veneers with slightly warmer tan glue lines, low contrast, light
overall. The end-grain of the tenon seen face-on and the edge of the side
panel seen from the side must match exactly in colour and contrast. Do not
make one darker, warmer or coarser than the other. No dark hardwood, no oak,
no dark glue lines.

Two colours in the whole frame: blue faces, tan striped edges. Brand-new
stock, clean and unhandled.

Reproduce the joint in IMAGE 1 exactly. Do not invent a different joinery, do
not add a wedge, do not let the tenon protrude. No text, no watermark, no
hands, no tools.
```

### `brk-vp-2` · 3:2 apaisado · la máquina cortando

Sin referencia de mueble. **IMAGEN 1 = la foto de la máquina real** (la
flatbed blanca de nesting), de donde salen el diseño y el color. **IMAGEN 2 =
la foto editorial del cabezal cortando**, de donde sale sólo el punto de
vista: cámara apoyada casi sobre la lámina y fondo disuelto.

**El fallo no es la máquina, es la distancia.** Pedir "un CNC en un taller"
da foto de nave con máquina adentro, y ninguna nave se ve bien. En la toma
editorial el local no existe: la cámara baja al nivel del material, el
husillo llena el encuadre y detrás sólo queda estructura desenfocada.

**Editorial no es oscuro.** La referencia de encuadre es un blanco y negro de
mucho contraste, y copiarle la clave saca una foto negra que pelea con la
máquina —blanca esmaltada— y con el resto de la página. Los tres pilares se
ven casi seguidos al bajar: los tres van en clave alta. Lo editorial lo pone
el plano de foco delgadísimo y el entorno ilegible, no la penumbra.

Y hay que decir **fresa, no láser**: las referencias de corte editorial casi
siempre son láser o plasma y el modelo copia la chispa.

```
IMAGE 1 = THE MACHINE. This is the equipment in the photograph and its
design must be copied: a modern industrial flatbed nesting router in
enamelled white and light grey steel, one deep blue accent panel, a dark grey
vacuum table with a pale wooden edge strip, a ribbed dust-extraction hose
looping down to the head, a row of boring spindles beside the router spindle.
Everything metal on it is either white enamel or clean machined steel — no
rust, no grime, no old iron, no yellowed plastic.

IMAGE 2 = the CAMERA POSITION only. Copy from it: the camera dropped right
down to the level of the sheet, the cutting head filling the frame and
cropped at the top by the gantry beam, the razor-thin plane of focus, the
background dissolved to nothing. Do NOT copy its darkness, its black and
white, its metal sheet or its laser head.

SUBJECT — The nose of a CNC router spindle, seen almost side-on from sheet
level, coming straight down into a sheet of birch plywood. The steel spindle
nose and its knurled collet nut, a two-flute spiral compression router bit
gripped in it, the bristle dust shoe pushed up around it. The bit is buried
in the material and moving: a fine spray of pale chips and dust throwing off
the cut, motion blur only in the chips.

THE CUT — Behind the bit, the kerf it has already opened runs away across the
sheet as a crisp curved slot, its walls showing the striped laminated core.
Further back, parts already cut and still held by tabs, reading as sharp
graphic shapes in the sheet.

BACKGROUND — Bright and abstract: the white enamel of the gantry beam and the
machine's own structure, thrown completely out of focus into a pale field of
white and light grey, with the blue accent panel as one soft defocused note.
NO room, NO walls, NO windows, NO floor, NO workshop, no tools, no clutter,
nobody. The environment must be unreadable — but it must be LIGHT, not dark.

FRAMING — Horizontal 3:2, landscape. The spindle stands vertically, slightly
off centre, running from the top edge of the frame down to the sheet. The
plane of the sheet runs across the lower third. Camera about 12 cm above the
surface, tilted a few degrees down.

CAMERA — 100 mm macro, f/2.8, very shallow. Only the bit tip and the first
few centimetres of the kerf are sharp; everything nearer and further melts.

LIGHT — High key. Bright, cool, even daylight filling the whole frame: the
white enamel reads white, not grey, and the shadows stay open and full of
detail. Keep one directional component low and from the side so the machined
steel of the spindle picks up crisp specular highlights and the kerf gets a
thin shadow line — that edge is what keeps it from going flat. Overall pale
and clean: whites, light greys and cool steel, with the warm tan of the
freshly cut plywood as the only warm colour. NOT dark, NOT moody, NOT
low-key, no black background, no dramatic chiaroscuro.

MATERIAL — Birch plywood. Every freshly routed edge shows the laminated core
as a striped tan band, the same tone and stripe rhythm on every edge.

NOT A LASER — This is mechanical milling with a rotating bit. No beam, no
spark, no glowing point, no molten edge, no burn mark, no smoke.

Photographic realism, editorial industrial photography. No people, no hands,
no text, no watermark, no brand names or logos.
```

### `brk-vp-3` · 3:2 apaisado · cantos apilados

Estudio. Sin referencia de mueble: es una foto de material.

```
A tight stack of CNC-cut birch plywood parts seen end-on, on a pure white
studio sweep, so the camera looks straight into the laminated edges.

FRAMING — Horizontal 3:2, landscape, clearly wider than tall.

SUBJECT — The stack fills the frame and is cropped by it, left to right.
Every visible edge is a band of seven to nine thin plies read as stripes,
crisp from the router, with the occasional tiny core void. The faces of the
boards are finished — some matte white, some matte black, some matte blue —
but every edge is cut from the same sheet and must read that way: identical
ply count, identical tone, identical stripe rhythm, pale cream veneers with
slightly warmer tan glue lines, low contrast. Not one edge darker, warmer or
coarser than its neighbour. The stripes run across the frame in near-parallel
lines.

BACKGROUND — Pure white seamless studio sweep above and behind the stack,
dissolving to clean white at the edges of the frame. No workshop, no bench,
no floor, no props.

LIGHT — Very large soft source high and slightly behind, white bounce from
the front. Almost shadowless, only thin cool-grey shadow lines between
boards. No hard shadow, no colour cast.

CAMERA — 100 mm macro at 40 cm, f/5.6. Sharp on the front third of the
stack, the rest falling off into soft white.

The striped tan core is the only warm colour in the frame. Brand-new stock,
clean and unhandled: no dust, no sawdust, no fingerprints, no tools, no
hands. Photographic realism. No text, no watermark.
```

### Las tres locaciones

Tres fotos tuyas, que se reparten entre los cinco huecos. Todas comparten la
misma paleta: desaturadas, frías, rústicas.

| Clave | Qué es |
|---|---|
| **MUELLE** | pasarela de madera sobre la laguna de Bacalar al atardecer, agua quieta como espejo, cielo pastel bajo, casi sin saturación |
| **TERRAZA** | plataforma de loseta blanca con barandal, sobre el agua turquesa, mediodía con cúmulos |
| **LOFT** | nave industrial de fotografía: piso de concreto, muros blancos, vigas de madera, ventanal de retícula metálica, manchas de sol duro en el suelo |

Reparto: la mesa va a la TERRAZA, el librero y la silla al LOFT, el banco al
MUELLE, y la pareja mesa+silla vuelve a la TERRAZA.

**La terraza sale dos veces**, en `life-1` y en `life-5`, y la mesa aparece en
las dos. Para que no se vean gemelas se separan por encuadre: la `life-1` es
cerrada, a altura de sentado y mirando al agua; la `life-5` va de pie y
mirando a lo largo de la terraza, con el barandal corriendo hacia el fondo.

### `brk-life-1` · 3:4 vertical · Mesa LLANO en la terraza

Pie propuesto: *Mesa LLANO en una terraza sobre la laguna de Bacalar.*

```
IMAGE 1 = a CNC-cut birch plywood square table. IMAGE 2 = a white tiled
terrace with a painted railing, over turquoise water, under cumulus cloud.

Place the table from IMAGE 1 on the tiled terrace of IMAGE 2, off centre and
close to the camera, seen from seated height and slightly from the front.
The table is 116 × 116 cm and 73 cm tall. Two enamel cups and a folded linen
cloth on the top — nothing else. The railing, the lagoon and the clouds
behind it. Finish: natural birch.

Vertical 3:4. Camera and lens exactly as in the block below.

[BLOQUE BASE]
```

### `brk-life-2` · 3:4 vertical · Librero RETÍCULA en el loft

Pie propuesto: *Librero RETÍCULA en un loft industrial, contra el ventanal.*

```
IMAGE 1 = a tall CNC-cut birch plywood shelving unit. IMAGE 2 = an
industrial photo loft: bare concrete floor, white walls, timber ceiling
beams, a big steel-gridded window throwing hard patches of light on the
floor.

Stand the shelving unit from IMAGE 1 upright on the concrete floor of
IMAGE 2, slightly left of centre, three-quarter view, camera at 1.4 m. It is
110 cm wide, 38 cm deep and 183 cm tall — taller than a person, keep that
scale against the window and the beams. Empty shelves, or two or three books
lying flat. One patch of window light falls across the floor beside it, not
on it. Finish: matte black, so the tan plywood edges draw the whole grid of
shelves and fins.

Vertical 3:4. Camera and lens exactly as in the block below — the unit is
sharp front to back, the loft behind it is not.

[BLOQUE BASE]
```

### `brk-life-3` · 3:4 vertical · Banco TRAMO en el muelle

Pie propuesto: *Banco TRAMO en un muelle de Bacalar, al caer la tarde.*

```
IMAGE 1 = a long CNC-cut birch plywood slatted bench with a deep dipping
seat. IMAGE 2 = a weathered timber jetty running out over a still lagoon at
dusk, pastel sky, mirror water.

Place the bench from IMAGE 1 along the jetty of IMAGE 2, seen from one end so
the row of ribs recedes and the dipping curve of the seat reads against the
water. It is 178 cm long, 60 cm deep and 45 cm tall, and it sits flat on the
boards along its whole length. Keep the grey planks, the still water and the
low pastel sky. Finish: natural birch.

Vertical 3:4. Lens and aperture exactly as in the block below, but drop the
camera to about 60 cm so the seat curve reads against the horizon.

[BLOQUE BASE]
```

### `brk-life-4` · 3:4 vertical · Silla CRESTA en el loft

Pie propuesto: *Silla CRESTA junto al ventanal, a media tarde.*

```
IMAGE 1 = a CNC-cut birch plywood chair with splayed side frames and a
wrap-around back. IMAGE 2 = an industrial photo loft: bare concrete floor,
white walls, timber ceiling beams, a big steel-gridded window.

Place a single chair from IMAGE 1 alone on the concrete floor of IMAGE 2,
near the window, turned three-quarters away from the camera as if someone
just left it, camera at 1.2 m, a little above the seat. It is 45 cm wide,
72 cm deep and 76 cm tall. Nothing else in the frame. The grid of the window
and one hard patch of light on the floor beside the chair. Finish: matte
blue, deep and desaturated, with the tan plywood edges outlining every panel.

Vertical 3:4. Camera and lens exactly as in the block below: sharp on the
chair, the loft soft.

[BLOQUE BASE]
```

### `brk-life-5` · 3:4 vertical · Mesa y silla en la terraza

Pie propuesto: *Mesa LLANO y Silla CRESTA en la terraza, a media tarde.*

**Éste lleva tres referencias.** El visor enseña un mueble por captura, así
que no existe un render con la mesa y la silla juntas. Lo que conviene meter
son las dos fotos de tarjeta ya hechas —`brk-p-llano.jpg` y
`brk-p-cresta.jpg`—: son fotográficas y tienen la geometría correcta, así
que el modelo copia mejor de ellas que de un render plano.

```
IMAGE 1 = the square table. IMAGE 2 = the chair. IMAGE 3 = a white tiled
terrace with a painted railing, over a wide pale lagoon, under cumulus cloud.

Remove the white concrete bench that stands in IMAGE 3 and put the table
from IMAGE 1 and the chair from IMAGE 2 on those tiles instead. The chair is
pulled out at an angle as if just used. Both seen from a standing height of
1.6 m, looking ALONG the terrace with the railing running away into the
frame — not straight out at the water. Table 116 × 116 × 73 cm, chair 45 cm
wide, 72 cm deep and 76 cm tall — the chair seat must sit well below the
table top. Finish: both in matte white, so the tan plywood edges draw every
part.

On the table top, off centre and away from the cross-shaped keys: a small
stoneware plate with a pastry on it, and one little cup of coffee on its
saucer. Nothing else — no flowers, no bottles, no phones, no people.

Vertical 3:4.

[BLOQUE BASE, con IMAGEN 3 como la locación]
```

**Los props se pusieron en segunda pasada**, sobre una imagen que ya estaba
bien resuelta. Cuando una foto ya tiene la integración, las alturas y la
paleta correctas, no se regenera para añadir un objeto: se le pide sólo el
objeto y su sombra.

```
Keep everything in this image exactly as it is: the table, the chair, their
position, the terrace, the railing, the water, the light, the framing and
the colour. Change nothing that is already there.

ADD ONLY THIS, on the table top: a small stoneware plate with a pastry on
it, and one little cup of coffee on its saucer. Place them off centre,
towards the near edge of the table, clear of the four cross-shaped keys so
those stay visible. Small objects — the plate is about 15 cm across, the cup
about 6 cm tall — scaled correctly against a 116 cm table.

They must sit ON the table, not float: a tight dark contact shadow under the
plate and under the saucer, a soft cast shadow falling in the SAME direction
as every other shadow in the picture, and the same slightly warm reflected
light on their undersides. Same grain, same haze, same muted palette as the
rest of the frame — the ceramics are pale and chalky, not glossy or
colourful.

Nothing else is added: no flowers, no bottles, no cutlery, no napkins, no
phones, no people.
```

## 2b. Tarjetas del catálogo · 4:5 · estudio claro

Los huecos `brk-p-cresta`, `brk-p-llano`, `brk-p-reticula` y `brk-p-tramo`.

**Cuidado con la proporción: el mismo id se pinta en dos formatos.** En la
portada la tarjeta es `aspect-[4/5]` (`product-card.tsx:17`) y en el catálogo
y en favoritos es `aspect-square` (`:58`). Una sola imagen sirve a los dos, y
`object-cover` recorta. Por eso se generan en **4:5 y con aire arriba y
abajo**: el recorte cuadrado se come el 20% del alto y no debe tocar la pieza.

**Las tarjetas no llevan ningún bloque base: el prompt se basta solo.** Van
en estudio claro, con el piso a la vista y una planta al lado. La sombra
suave que el mueble proyecta sobre ese piso es lo que lo planta en el suelo,
y sale bien a la primera — mucho más seguro que componer sobre una foto de
locación, donde el mueble acaba pareciendo un recorte.

**Las cuatro van en el mismo set y con la misma luz.** Se ven una junto a
otra en una fila; si cada mueble sale en un sitio distinto, la fila se lee
como un álbum de recortes en vez de como una colección.

Como vuelve a ser estudio, **el mismo archivo sirve para `brk-g-<id>-0`**,
la general de la ficha: son ocho huecos y cuatro imágenes.

**Medido en la primera: el piso de abajo se queda corto.** La de la silla
salió 825×1024 con las patas en y=925, y el recorte cuadrado del catálogo
corta justo en 925: cero holgura. Se ve bien, pero es filo de navaja. Por eso
el prompt pide ahora un 12% de piso vacío bajo las patas.

**El cojín de la silla.** Va suelto sobre el asiento, gris azulado, y una vez
que aparece en una foto tiene que aparecer en todas las de la silla —
tarjeta, ficha y `life-4`—, o el catálogo se contradice. Ojo: no está en el
DXF, así que el visor 3D lo muestra sin cojín y el precio no lo cobra. Si es
un accesorio de venta hay que darlo de alta; si es sólo utilería, la foto
promete de más.

Referencia: sólo el render del mueble, capturado del visor sin cuadrícula ni
rótulos.

```
IMAGE 1 = a CNC-cut birch plywood chair.

Product photograph of the chair from IMAGE 1 for a furniture catalogue,
three-quarter front view, camera at seat height. Finish: natural birch.

FRAMING — Vertical 4:5. The chair is complete, roughly centred left to
right, and fills about 60% of the frame height. Leave at least 12% of the
frame height as empty floor BELOW the feet, and open space above: a square
crop through the middle of this frame must still contain the whole chair,
feet included, with room to spare. Never crop the chair and never let it
touch an edge.

SET — A clean, bright studio sweep: pale warm grey, with the floor plane
visible and reading as floor and the wall dissolving into it in a soft
gradient behind the chair. NO vertical corner line, no second wall, no
skirting, no horizon line, no texture, no room, no location — the background
is one continuous surface.

PROP — One potted plant, and nothing else: a green leafy plant in a plain
white ceramic pot, standing on the floor to one side and slightly behind the
chair, partly cropped by the edge of the frame. It is a companion, not the
subject: smaller in the frame than the chair and never overlapping it. No
other props, no rugs, no people, no lamps, no books.

LIGHT — One very large soft source high and to the front-left, plus soft
fill from the right. Bright, even, cool daylight with open shadows. The
chair casts one soft grey shadow low across the floor to the right, and each
foot has a small darker contact patch where it meets the floor — that
shadow is what stands it on the ground.

CAMERA — 85 mm lens, about 2.5 m away, at seat height, f/5.6. The chair is
sharp front to back; the plant and the sweep behind it fall very gently off.

CUSHION — Add one loose seat cushion and nothing else: a single flat pad of
grey-blue woven fabric, slightly domed, resting inside the frame on the seat
panel between the two side frames. It fills the seat exactly, about 6 cm
thick, with soft rounded corners and a visible fabric weave. Loose and
unattached: no buttons, no tufting, no piping, no straps, no back cushion.

MATERIAL — Matte natural birch laminate on the faces: smooth and even, no
stucco or orange-peel texture, no brush marks, a slight satin sheen only.
Every cut edge shows the laminated core as a striped tan band, and every
edge in the frame is cut from the same sheet: same ply count, same tone,
same stripe rhythm. The face colour stops dead at the arris.

NON-NEGOTIABLE — Reproduce the chair in IMAGE 1 exactly: same number of
parts, same splay of the legs, same wrap of the back, same flush through
tenons. The seat cushion is the ONLY thing added to it. No visible hardware,
no screws.

Photographic realism, catalogue quality. No text, no watermark, no logos.
```

### Qué cambia y qué no, de una tarjeta a otra

**No cambia nada del set:** mismo barrido, misma luz, misma cámara, mismo
encuadre 4:5 con piso bajo las patas. Eso es lo que hace que las cuatro se
lean como una colección y no como cuatro fotos sueltas.

**Cambian dos cosas:** el ángulo y el accesorio. Un accesorio por mueble,
propio de su función — todas con la misma planta se vería a plantilla.

| Mueble | Vista | Accesorio |
|---|---|---|
| Silla CRESTA | tres cuartos, a la altura del asiento | planta de hoja grande en maceta blanca, al lado |
| Mesa LLANO | tres cuartos, un poco desde arriba, para que se vean las cruces | dos libros de tapa dura y un cuenco de cerámica mate, sobre la cubierta |
| Librero RETÍCULA | de frente, sin fuga | unos libros acostados en dos entrepaños y una vasija de cerámica |
| Banco TRAMO | de lado, la curva del asiento contra el fondo | una manta de lino doblada colgando de un extremo, y una planta alta en maceta de barro |

> **Las dos fotos del banco que están puestas son provisionales y están mal**
> — la tarjeta (`brk-p-tramo`) y la de locación (`brk-life-3`). Las dos
> enseñan el fondo arqueado, con el banco apoyado sólo en los extremos y el
> piso o el muelle viéndose por debajo del centro. Se aceptaron a sabiendas,
> porque el mueble va a cambiar. No deben publicarse así: en cuanto exista el
> DXF nuevo hay que regenerar las dos.
>
> Dos intentos con el mismo fallo, el segundo con la silueta en números
> dentro del prompt. Los modelos tienen muy metido el banco-puente. Para el
> mueble nuevo, meter como referencia extra una captura del visor **en alzado
> lateral puro**: enseñarle la silueta funciona mejor que describírsela.

**La silueta del banco, medida.** Proyectando el contorno de las 29 costillas
al mundo: el asiento está a **452 mm en los dos extremos y baja hasta 184 mm
en el centro** —268 mm, más de la mitad de la altura—, y **las 29 costillas
apoyan en el suelo**, todas con la base en z≈2. Es una hamaca, no un puente:
si en la foto el borde de arriba sale casi a nivel y lo que se arquea es el
fondo, el mueble está mal y hay que repetir. Sin los números el modelo dibuja
un arco.

El accesorio siempre va **sin tocar el mueble por delante**: acompaña, no
tapa.

**Si se repite planta, que no sea la misma.** El banco es largo y bajo y deja
mucho barrido vacío a los lados, así que lleva planta además de la manta. Pero
la de la silla es una ficus lira en maceta blanca de cerámica; la del banco va
alta y estrecha, en maceta de barro. Misma familia de accesorio, distinta
pieza — si no, las dos tarjetas se ven calcadas.

**El fondo, sin esquina.** En la de la mesa se coló la arista vertical de un
rincón y en la de la silla no la hay, así que las dos no casan del todo. El
bloque SET pide ahora una sola superficie continua.

**Los muebles altos no caben en el recorte cuadrado.** El librero llegó
ocupando el 79% del alto del 4:5, y en el cuadrado del catálogo eso deja unos
20 px de margen en total: se comía 22 px de las patas. Hubo que prolongarle el
piso 64 px. Para una pieza alta hay que pedirle al modelo que la deje **más
pequeña dentro del cuadro**, no sólo que deje piso: un 60% del alto, no un
79%.

---

## 3. Fichas de producto · 1:1

Tres por mueble. Aquí **no** hay locación: estudio o taller, y el sujeto es la
pieza y su construcción, no la escena. El bloque base no aplica; cada prompt
trae su propia luz.

Referencia: sólo el render del mueble en el acabado que pida el prompt.

### Silla CRESTA — 45 × 72 × 76 cm

**0 · general, estudio**
```
IMAGE 1 = a CNC-cut birch plywood chair.

Studio product photograph of the chair from IMAGE 1, three-quarter front
view, camera at seat height. Pure white seamless studio sweep, no horizon
line.
Large soft light from the upper left, subtle fill from the right, soft
gradient shadow under the chair. Finish: natural birch.

Square 1:1, the chair centred with generous margin. 85 mm lens, f/8, sharp
throughout.

Birch plywood: the faces carry the finish, every cut edge shows the raw
laminated core as a striped tan band. Reproduce the chair in IMAGE 1 exactly
— same parts, same splay of the legs, same wrap of the back. No cushions, no
visible hardware. No text, no watermark.
```

**1 · detalle de la unión**
```
IMAGE 1 = a CNC-cut birch plywood chair.

Extreme close-up of a through-tenon joint on the chair from IMAGE 1, shot on
a pure white studio sweep.

THE JOINT — A 65 x 18 mm rectangular tenon passes right through an 18 mm
plywood side panel and stops dead flush with its outer face: a rectangle of
striped plywood end-grain set level into the finished face of the panel,
ringed by the hairline gap of the joint. Nothing protrudes. No wedge, no peg,
no screw, no dowel, no visible hardware.

FRAMING — Square 1:1. The joint fills the frame and is cropped by it, the
rectangle of end-grain just off centre, the seat board receding out of focus
to one side. Camera a hand's width away, about 20 degrees off the panel face
so the flushness reads.

BACKGROUND — Pure white seamless studio sweep, dissolving behind the piece.
No workshop, no bench, no sawdust, no props.

LIGHT — Very large soft source high and slightly behind, white bounce from
the front. Wraparound, almost shadowless: a faint cool-grey gradient and the
thin shadow line inside the joint gap. No hard shadow, no colour cast.

CAMERA — 100 mm macro at 30 cm, f/4. Sharp on the tenon end-grain.

FACES — All panel faces are matte black laminate, very dark and nearly
neutral: the typical face reads #080808, the planes turned away go to pure
black, and only the plane facing the light reaches #2C2C2C. Not charcoal, not
dark grey — black. Smooth and perfectly even: no wood grain showing through,
no stucco or orange-peel texture, no brush marks, a slight satin sheen only.
The black stops dead at the arris; no edge is ever painted.

EDGES — Every exposed plywood edge in the frame is cut from the same
sheet and must read that way: same ply count, same tone, same stripe
rhythm — pale cream veneers with slightly warmer tan glue lines, low
contrast, light overall. An edge seen face-on and an edge seen from the
side must match exactly in colour and contrast. Do not make one darker,
warmer or coarser than another. No dark hardwood, no oak, no dark glue
lines.

Two colours in the whole frame: black faces, tan striped edges. Brand-new
stock, clean and unhandled.

Reproduce the joint in IMAGE 1 exactly: do not add a wedge, do not let the
tenon protrude. No hands, no tools, no text, no watermark.
```

**2 · lateral, taller**
```
IMAGE 1 = a CNC-cut birch plywood chair.

The chair from IMAGE 1 in pure side elevation, so the A-shaped side frame
reads as a flat silhouette: the two splayed legs, the void between them, the
rising back. Against a plain plywood workshop wall, chair standing on a
concrete floor. Cold overcast light from a high window, long soft shadow to
one side. Finish: matte black, so the tan edges outline the silhouette.

Square 1:1, camera exactly level with the seat, no perspective distortion.
85 mm lens, f/8.

Reproduce the profile in IMAGE 1 line for line. No text, no watermark.
```

### Mesa LLANO — 116 × 116 × 73 cm

**0 · general, estudio**
```
IMAGE 1 = a CNC-cut birch plywood square table.

Studio product photograph of the table from IMAGE 1, three-quarter view,
camera slightly above the top so the four cross-shaped keys on the surface
are legible. Pure white seamless studio sweep. Large soft light from the upper
left, soft gradient shadow beneath. Finish: natural birch.

Square 1:1, table centred with margin. 85 mm lens, f/8, sharp throughout.

Birch plywood: faces finished, every cut edge showing the striped raw core.
Reproduce the table in IMAGE 1 exactly — four legs, the pinwheel of the
frame, the four crosses in the top. No text, no watermark.
```

**1 · detalle de la cruceta**
```
IMAGE 1 = a CNC-cut birch plywood square table.

Extreme close-up of one of the four cross-shaped keys in the table top from
IMAGE 1, shot on a pure white studio sweep.

THE JOINT — Two legs cross underneath and each sends a tenon up through the
30 mm top; the two tenons interlock and stop dead flush with the surface,
reading from above as a cross of striped plywood end-grain set level into the
finished top, ringed by the hairline gap of the mortise. Nothing protrudes,
nothing is glued proud. No screws, no plugs, no visible hardware.

FRAMING — Square 1:1, camera from above and about 30 degrees to the side so
both the cross and the flatness of the top read at once. The cross fills the
centre, the top surface runs out of frame on every side.

BACKGROUND — Pure white. The top itself is most of the frame; anything beyond
its edge dissolves into clean white. No workshop, no bench, no props.

LIGHT — Very large soft source high and slightly behind, white bounce from
the front, plus a low raking component along the top so the flush surface and
the joint gap read. Almost shadowless otherwise. No hard shadow, no colour
cast.

CAMERA — 100 mm macro at 35 cm, f/5.6. Sharp on the cross, the far edge of
the top falling off.

FACES — All panel faces are matte navy laminate, very dark: midnight navy
ink, much closer to black than to blue. The top reads #081C34, the planes
turned away go down to #041830, and only the plane facing the light reaches
#2C4868. Not slate blue, not petrol, not denim. Smooth and perfectly even —
no wood grain showing through, no stucco or orange-peel texture, no brush
marks, a slight satin sheen only. The navy stops dead at the arris; no edge
is ever painted.

EDGES — Every exposed plywood edge in the frame is cut from the same
sheet and must read that way: same ply count, same tone, same stripe
rhythm — pale cream veneers with slightly warmer tan glue lines, low
contrast, light overall. An edge seen face-on and an edge seen from the
side must match exactly in colour and contrast. Do not make one darker,
warmer or coarser than another. No dark hardwood, no oak, no dark glue
lines. Router-cut edges keep the bit's small radius and
the relief notches the cutter leaves in the inside corners of the mortise.

Two colours in the whole frame: blue faces, tan striped edges. Brand-new
stock, clean and unhandled.

Reproduce the joint in IMAGE 1 exactly: two tenons meeting in a cross, flush
with the top. No dust, no fingerprints, no text, no watermark.
```

**2 · la pata, taller**
```
IMAGE 1 = a CNC-cut birch plywood square table.

Low three-quarter view of one corner of the table from IMAGE 1, camera at
30 cm from the floor, looking up along the leg to where it crosses its
neighbour under the top and continues into the table surface. The half-lap
where the two legs cross is the centre of the frame.

Plywood workshop wall behind, concrete floor, cold overcast light. Finish:
matte blue, deep and desaturated, tan edges drawing every part.

Square 1:1. 35 mm lens, f/5.6.

Reproduce the crossing of the legs exactly as in IMAGE 1. No text, no
watermark.
```

### Librero RETÍCULA — 110 × 38 × 183 cm

**0 · general, estudio**
```
IMAGE 1 = a tall CNC-cut birch plywood shelving unit.

Studio product photograph of the unit from IMAGE 1, straight-on front
elevation, camera at mid height, no perspective distortion, so the grid of
shelves and vertical fins reads flat and even. Pure white seamless studio
sweep,
soft shadow at the feet. Empty shelves. Finish: natural birch.

Square 1:1, the unit centred and fully in frame with margin above and below.
85 mm lens, f/8.

Birch plywood: faces finished, every cut edge showing the striped raw core.
Reproduce the unit in IMAGE 1 exactly — same number of shelves, same three
verticals, same overhang of the shelves past the outer verticals. No text, no
watermark.
```

**1 · detalle de la caja**
```
IMAGE 1 = a tall CNC-cut birch plywood shelving unit.

Extreme close-up of one crossing where a vertical fin meets a shelf in the
unit from IMAGE 1, shot on a pure white studio sweep.

THE JOINT — A 12 mm shelf running horizontally and a 12 mm vertical fin
meeting at ninety degrees, their two striped plywood edges crossing in the
middle of the frame in a clean T, with the hairline joint line between them.
No screws, no brackets, no dowels, no visible hardware of any kind.

FRAMING — Square 1:1. The crossing fills the frame and is cropped by it; both
boards run out of the frame. Camera a hand's width away, slightly off axis so
the 12 mm thickness of both boards reads as a striped band.

BACKGROUND — Pure white seamless studio sweep, dissolving behind the boards.
No workshop, no bench, no books, no props.

LIGHT — Very large soft source high and slightly behind, white bounce from
the front. Almost shadowless, with just enough direction that a thin cool-grey
shadow line marks where the shelf meets the fin. No hard shadow, no colour
cast.

CAMERA — 100 mm macro at 30 cm, f/4. Sharp on the crossing, both boards
falling off into soft white as they recede.

FACES — All panel faces are matte white laminate, reading a touch darker
than the white sweep behind them so the piece separates: the typical face is
#ACA8A4, the planes turned away go to #7C7C74, and only the plane facing the
light reaches #C8C4BC. Warm off-white, never pure paper white. Smooth and
perfectly even: no wood grain showing through, no stucco or orange-peel
texture, no brush marks, a slight satin sheen only. The white stops dead at
the arris; no edge is ever painted.

EDGES — Every exposed plywood edge in the frame is cut from the same
sheet and must read that way: same ply count, same tone, same stripe
rhythm — pale cream veneers with slightly warmer tan glue lines, low
contrast, light overall. An edge seen face-on and an edge seen from the
side must match exactly in colour and contrast. Do not make one darker,
warmer or coarser than another. No dark hardwood, no oak, no dark glue
lines.

Against the white sweep the piece reads almost entirely by its tan striped
edges. That is the point of the shot. Brand-new stock, clean and unhandled.

Reproduce the crossing in IMAGE 1 exactly. No dust, no fingerprints, no
hands, no text, no watermark.
```

**2 · tres cuartos, taller**
```
IMAGE 1 = a tall CNC-cut birch plywood shelving unit.

The unit from IMAGE 1 in three-quarter view, camera at 1.4 m, against a
plywood workshop wall on a concrete floor, so the 38 cm depth and the
staggered rhythm of the fins read. A few books lying flat on two shelves.
Cold overcast light from a high window on the left, long soft shadow to the
right. Finish: matte white, tan edges drawing the whole grid.

Square 1:1. 35 mm lens, f/5.6, sharp throughout.

Reproduce the unit in IMAGE 1 exactly. No text, no watermark.
```

### Banco TRAMO — 178 × 60 × 45 cm

**0 · general, estudio**
```
IMAGE 1 = a long CNC-cut birch plywood slatted bench with a curved dipping
seat.

Studio product photograph of the bench from IMAGE 1 in pure side elevation,
camera level with the seat, no perspective distortion, so the curve of the
top edge — high at both ends, dipping at the centre — reads as a clean
silhouette. Pure white seamless studio sweep, soft shadow beneath. Finish:
natural
birch.

Square 1:1, bench centred, its full length in frame. 85 mm lens, f/8.

Birch plywood. Reproduce the bench in IMAGE 1 exactly: same number of ribs,
same spacing, same curve. Do not smooth the ribs into a solid mass. No text,
no watermark.
```

**1 · detalle del peine**
```
IMAGE 1 = a long CNC-cut birch plywood slatted bench.

Extreme close-up along the bench from IMAGE 1, shot on a pure white studio
sweep.

SUBJECT — Camera almost at the level of the seat, looking down the row of
ribs so they recede into the frame as a comb of parallel plates with even
gaps between them. Every rib is a different width — they taper from wide at
the centre of the bench to narrow at the ends — and the two long spines
threading through them are visible in the gaps underneath. The top edge of
each rib is the striped plywood core.

FRAMING — Square 1:1. The comb fills the frame and is cropped by it; no rib
is fully contained.

BACKGROUND — Pure white seamless studio sweep. Beyond the last rib in focus
everything dissolves to clean white. No workshop, no floor, no props.

LIGHT — Very large soft source high and slightly behind, white bounce from
the front, with just enough direction that each rib lays a thin cool-grey
shadow on the next. No hard shadow, no colour cast.

CAMERA — 100 mm macro at 35 cm, f/2.8. Sharp on the third or fourth rib, the
rest falling off fast into soft white.

FACES — All panel faces are matte black laminate, very dark and nearly
neutral: the typical face reads #080808, the planes turned away go to pure
black, and only the plane facing the light reaches #2C2C2C. Not charcoal, not
dark grey — black. Smooth and perfectly even: no wood grain showing through,
no stucco or orange-peel texture, no brush marks, a slight satin sheen only.
The black stops dead at the arris; no edge is ever painted.

EDGES — Every exposed plywood edge in the frame is cut from the same
sheet and must read that way: same ply count, same tone, same stripe
rhythm — pale cream veneers with slightly warmer tan glue lines, low
contrast, light overall. An edge seen face-on and an edge seen from the
side must match exactly in colour and contrast. Do not make one darker,
warmer or coarser than another. No dark hardwood, no oak, no dark glue
lines.

Two colours in the whole frame: black faces, tan striped edges. Brand-new
stock, clean and unhandled.

Reproduce the rib spacing, the varying rib widths and the two spines exactly
as in IMAGE 1. No dust, no fingerprints, no text, no watermark.
```

**2 · tres cuartos, taller**
```
IMAGE 1 = a long CNC-cut birch plywood slatted bench.

The bench from IMAGE 1 in three-quarter view, camera at 1.2 m and slightly
above, on a concrete workshop floor against a plywood wall, so both the
length and the dip of the seat read at once. Cold overcast light from a high
window. Finish: matte black, the tan plywood edges drawing every single rib.

Square 1:1. 35 mm lens, f/5.6, sharp throughout.

Reproduce the bench in IMAGE 1 exactly — same rib count, same curve. No text,
no watermark.
```

---

## 4. Reparto de acabados

Para que los cuatro aparezcan y el conjunto no se vea monótono:

| Acabado | Dónde |
|---|---|
| Abedul natural | hero, life-1, life-3, y la general de estudio de los cuatro muebles |
| Blanco | life-5, librero tres cuartos |
| Negro | life-2, silla lateral, banco tres cuartos |
| Azul | vp-1, life-4, mesa pata |

**En los close-ups, nunca abedul natural.** Un macro de una cara sin color
obliga al modelo a inventar veta y sale una superficie rugosa que no existe:
el triplay lacado es liso. Los detalles van en acabado de color, que además
separa la cara del canto — que es lo que la foto tiene que contar.

### Los colores, como se ven en el catálogo

**No usar los hex de `precio.ts` en los prompts.** Ésos son el color base del
material; el visor los pasa por tone mapping ACES (`visor.tsx:93`), que baja
todo a ~0.7×. Pedirle a la IA el hex crudo da una foto lavada que no coincide
con el 3D de la misma ficha. Estos valores están medidos sobre el canvas del
visor —histograma de la silla, sin interfaz— y son los que van en el prompt:

| Acabado | base en `precio.ts` | cara dominante | 2ª cara | sombra | plano a la luz |
|---|---|---|---|---|---|
| Azul | `#2F4B6B` | **`#081C34`** | `#041830` | `#000C1C` | `#2C4868` |
| Negro | `#2E2E2C` | **`#080808`** | `#000000` | `#000000` | `#2C2C2C` |
| Blanco | `#EDE9E1` | **`#ACA8A4`** | `#A8A4A0` | `#7C7C74` | `#C8C4BC` |
| Abedul | `#DCC9A6` | **`#A09478`** | `#9C8C70` | `#70644C` | `#B8AC94` |

Dar siempre los tres o cuatro valores, no uno solo: con un único hex el
modelo pinta la pieza plana. El rango es lo que le da volumen.

**El canto.** En el visor es un café liso, `#906C40` medido, porque el 3D
pinta el corazón del triplay como un color sólido. En foto ese mismo canto es
una franja rayada de chapas crema y líneas de cola más cálidas; el promedio
cae justo ahí. Describirlo rayado en el prompt y no forzarle el hex, o sale
un canto café plano.

---

## 5. Qué revisar antes de dar una imagen por buena

**Lo primero, la proporción.** Cada prompt la lleva escrita porque el hueco la
impone y `object-cover` recorta lo que sobre: `brk-hero` es 2:1, los `brk-vp-*`
son 3:2 apaisados, las `brk-life-*` 3:4 verticales y las de ficha 1:1. Si el
modelo entrega otra cosa, repetir el prompt con la línea de proporción al
principio, no al final.

1. **El canto.** Si algún tablero no muestra la banda rayada del corazón, la
   imagen no sirve: el modelo lo laminó.
2. **El conteo.** Costillas del banco, entrepaños del librero, patas de la
   mesa. Si cambió el número, el modelo redibujó.
3. **La escala.** Contra el barandal, los árboles, la silla junto a la mesa.
4. **La luz.** Si salió sol dorado, se fue del amanecer nublado y hay que
   repetir insistiendo en `cold, overcast, no direct sun`.
5. **La proporción.** 2:1 el hero, 3:2 los de proceso, 3:4 los de locación,
   1:1 los de ficha. Generar en otra y recortar deja el mueble descentrado.

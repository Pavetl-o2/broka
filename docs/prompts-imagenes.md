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

LIGHT — Overcast dawn, tropical. Heavy grey cloud with a single break where
diffuse rays fan down. No hard sun, no visible sun disc. Cool blue-grey
palette, silver on water and wet stone, open shadows with detail. Soft,
humid, still. Golden hour warmth is WRONG — this is cold, quiet, dramatic.

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

**Dos pasadas.** Los dos modelos corrigen mejor de lo que crean. Pasada 1:
sacar la escena con la geometría correcta, aunque quede plana. Pasada 2:
volver a meter ese resultado como referencia con sólo esto:

```
Keep the composition and the object exactly as they are. Only fix the
integration: add the contact shadow under each foot, ambient occlusion in the
inside corners, bounce light from the ground onto the underside, rim light on
the top edges from the bright sky, and a soft reflection in the wet floor.
Throw the background further out of focus. The object must look photographed
in place, not composited.
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

FRAMING — The joint fills the frame and is cropped by it: the rectangle of
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

FACES — All panel faces are matte blue laminate: a deep, desaturated slate
blue, roughly #2F4B6B. Smooth and perfectly even — no wood grain showing
through, no stucco or orange-peel texture, no brush marks, a slight satin
sheen only. The blue stops dead at the arris; no edge is ever painted blue.

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

Sin referencia de mueble. Escena de taller.

```
A 3-axis CNC router mid-cut on a full 2440 × 1220 mm sheet of birch plywood.
The bit is down in the material, a curl of shavings lifting into the air,
vacuum hose just out of frame. Already-cut parts visible in the sheet around
it, still held by tabs — long curved leg profiles and a big square top with
cross-shaped mortises.

Cold overcast daylight from a high workshop window, no direct sun. Fine dust
suspended in the light. Blue-grey palette, warm tan wood.

Horizontal 3:2. 50 mm lens, f/2.8, sharp on the bit, motion blur only in the
flying shavings.

Photographic realism. No text, no watermark, no people.
```

### `brk-vp-3` · 3:2 apaisado · cantos apilados

Estudio. Sin referencia de mueble: es una foto de material.

```
A tight stack of CNC-cut birch plywood parts seen end-on, on a pure white
studio sweep, so the camera looks straight into the laminated edges.

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

### `brk-life-1` · 3:4 vertical · Mesa LLANO en la terraza de la laguna

Pie de foto propuesto: *Mesa LLANO en una terraza de Bacalar, al amanecer.*

```
IMAGE 1 = a CNC-cut birch plywood square table. IMAGE 2 = a terrace
overlooking a lagoon at dawn.

Place the table from IMAGE 1 on the terrace of IMAGE 2, centred, seen from
seated height, slightly from the front. The table is 116 × 116 cm and 73 cm
tall. Two enamel cups and a folded linen cloth on the top — nothing else. The
lagoon, the cloud break and the rays behind it. Finish: natural birch.

Vertical 3:4. 40 mm lens, f/4.

[BLOQUE BASE]
```

### `brk-life-2` · 3:4 vertical · Librero RETÍCULA en el damero

Pie propuesto: *Librero RETÍCULA sobre el damero de una terraza recuperada por la selva.*

```
IMAGE 1 = a tall CNC-cut birch plywood shelving unit. IMAGE 2 = an abandoned
checkerboard tile terrace swallowed by jungle.

Stand the shelving unit from IMAGE 1 upright on the checkerboard floor of
IMAGE 2, slightly left of centre, three-quarter view, camera at 1.4 m. It is
110 cm wide, 38 cm deep and 183 cm tall — taller than a person, keep that
scale against the trees. Empty shelves, or two or three books flat. The green
wall of vegetation behind it, storm cloud above. Finish: matte black, so the
tan plywood edges draw the whole grid of shelves and fins.

Vertical 3:4. 35 mm lens, f/5.6, sharp throughout.

[BLOQUE BASE]
```

### `brk-life-3` · 3:4 vertical · Banco TRAMO en el mirador

Pie propuesto: *Banco TRAMO en un mirador sobre el agua, antes de que salga el sol.*

```
IMAGE 1 = a long CNC-cut birch plywood slatted bench with a curved dipping
seat. IMAGE 2 = a tiled terrace with a white concrete bench overlooking water
at dawn.

Remove the white concrete bench from IMAGE 2 and put the bench from IMAGE 1
in its place, along the railing, seen from one end so the row of slats
recedes and the curve of the seat reads against the horizon. It is 178 cm
long, 60 cm deep and 45 cm tall. Keep the terrace tiles, the railing, the
pole and the pale misted water. Finish: natural birch.

Vertical 3:4. 28 mm lens, f/5.6, low camera at about 60 cm.

[BLOQUE BASE]
```

### `brk-life-4` · 3:4 vertical · Silla CRESTA en el damero

Pie propuesto: *Silla CRESTA sola en el damero, a la hora en que baja la luz.*

> Este hueco pedía el Escritorio VERTIENTE, que ya no existe. Propuesta: la silla.

```
IMAGE 1 = a CNC-cut birch plywood chair with splayed side frames and a
wrap-around back. IMAGE 2 = an abandoned checkerboard tile terrace swallowed
by jungle.

Place a single chair from IMAGE 1 alone on the checkerboard floor of IMAGE 2,
turned three-quarters away from the camera as if someone just left it, camera
at 1.2 m, a little above the seat. It is 45 cm wide, 72 cm deep and 76 cm
tall. Nothing else in the frame. The checkerboard runs to the wall of
vegetation. Finish: matte blue, deep and desaturated, with the tan plywood
edges outlining every panel.

Vertical 3:4. 50 mm lens, f/2.8, sharp on the chair, vegetation soft.

[BLOQUE BASE]
```

### `brk-life-5` · 3:4 vertical · Silla y mesa en la terraza

Pie propuesto: *Mesa LLANO y Silla CRESTA frente a la laguna.*

> Este hueco pedía el Buró NUDO, que ya no existe. Propuesta: la pareja.

```
IMAGE 1 = a CNC-cut birch plywood square table and matching chair. IMAGE 2 =
a terrace overlooking a lagoon at dawn.

Place the table and one chair from IMAGE 1 on the terrace of IMAGE 2, the
chair pulled out at an angle as if just used, both seen from a standing
height of 1.6 m. Table 116 × 116 × 73 cm, chair 45 × 72 × 76 cm — the chair
seat must sit well below the table top. The lagoon and the rays behind.
Finish: both in matte white, so the tan plywood edges draw every part.

Vertical 3:4. 35 mm lens, f/4.

[BLOQUE BASE]
```

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

FACES — All panel faces are matte black laminate. Smooth and
perfectly even — no wood grain showing through, no stucco or orange-peel
texture, no brush marks, a slight satin sheen only. The face colour stops
dead at the arris; no edge is ever painted.

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

FACES — All panel faces are matte blue laminate, a deep desaturated slate blue,
roughly #2F4B6B. Smooth and
perfectly even — no wood grain showing through, no stucco or orange-peel
texture, no brush marks, a slight satin sheen only. The face colour stops
dead at the arris; no edge is ever painted.

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

FACES — All panel faces are matte white laminate. Smooth and
perfectly even — no wood grain showing through, no stucco or orange-peel
texture, no brush marks, a slight satin sheen only. The face colour stops
dead at the arris; no edge is ever painted.

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

FACES — All panel faces are matte black laminate. Smooth and
perfectly even — no wood grain showing through, no stucco or orange-peel
texture, no brush marks, a slight satin sheen only. The face colour stops
dead at the arris; no edge is ever painted.

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

---

## 5. Qué revisar antes de dar una imagen por buena

1. **El canto.** Si algún tablero no muestra la banda rayada del corazón, la
   imagen no sirve: el modelo lo laminó.
2. **El conteo.** Costillas del banco, entrepaños del librero, patas de la
   mesa. Si cambió el número, el modelo redibujó.
3. **La escala.** Contra el barandal, los árboles, la silla junto a la mesa.
4. **La luz.** Si salió sol dorado, se fue del amanecer nublado y hay que
   repetir insistiendo en `cold, overcast, no direct sun`.
5. **La proporción.** 2:1 el hero, 3:2 los de proceso, 3:4 los de locación,
   1:1 los de ficha. Generar en otra y recortar deja el mueble descentrado.

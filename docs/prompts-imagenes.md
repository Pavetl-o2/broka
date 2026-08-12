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

```
LIGHT — Overcast dawn, tropical. Heavy grey cloud cover with a single break
where diffuse crepuscular rays fan downward. No hard direct sun, no visible
sun disc. Cool blue-grey palette, silver highlights on water and wet surfaces,
open shadows with detail. Soft, humid, still atmosphere. High dynamic range,
gentle contrast. Golden hour warmth is WRONG — this is cold, quiet, dramatic.

MATERIAL — Birch plywood, CNC cut, flat-pack. The panel FACES carry the
finish. Every cut EDGE shows the raw laminated plywood core: a warm tan
striped band, clearly visible against the face colour. This edge line must
read on every single part — it is the signature of the product.

NON-NEGOTIABLE — Reproduce the object in IMAGE 1 exactly: same number of
parts, same proportions, same joints, same angles. Do not restyle it, do not
add or remove parts, do not soften or round anything, do not add upholstery,
cushions, hardware or visible screws. Keep the location in IMAGE 2 as it is:
same architecture, same ground, same vegetation, same horizon. Only add the
furniture and relight the scene.

OUTPUT — Photographic realism. Full-frame camera look, natural perspective,
no fisheye. The piece rests on the ground with a soft contact shadow that
matches the overcast light. No text, no watermark, no logos, no people unless
the prompt asks for them.
```

---

## 2. Portada

### `brk-hero` · 2:1 apaisado · Mesa LLANO, abedul natural

Referencias: render de la mesa + foto de la laguna al amanecer.

```
IMAGE 1 = a CNC-cut birch plywood square table. IMAGE 2 = a terrace
overlooking a lagoon at dawn.

Place the table from IMAGE 1 on the terrace of IMAGE 2, in the lower left
third, seen from a standing height of about 1.6 m, three-quarter view. The
table is 116 × 116 cm and 73 cm tall — keep that scale honest against the
railing and the vegetation. The lagoon, the cloud break and the rays stay as
the background and fill the upper two thirds. Wet terrace floor reflecting
the sky. Finish: natural birch, warm pale wood.

Wide horizontal framing, 2:1. 35 mm lens, everything sharp from the table to
the far shore.

[BLOQUE BASE]
```

### `brk-vp-1` · 3:2 apaisado · macro de unión

Sin locación. Sólo el render de la silla o de la mesa, muy cerca.

```
IMAGE 1 = a CNC-cut birch plywood chair.

Extreme close-up of the joint where the through-tenon passes through the side
panel and is locked by the wedge. Fill the frame with the joint: the tenon
coming through, the wedge driven into it, the striped plywood edge of both
parts. Shallow depth of field, sharp on the wedge, background falling off.

Workshop context, barely readable: a plywood workbench, sawdust in the seams,
cold north light from a high window. Overcast, no direct sun.

Horizontal 3:2. 100 mm macro lens, f/4.

Birch plywood. The cut edges show the laminated core as a striped tan band —
this is the subject of the photograph. Reproduce the joint in IMAGE 1 exactly;
do not invent a different joinery. No text, no watermark, no hands.
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

```
A tight stack of CNC-cut birch plywood parts seen end-on, so the camera looks
straight into the laminated edges. Dozens of thin light and dark plies
stacked into stripes, edges crisp from the router, slight fuzz of fibre. Some
parts finished on the face in matte white, some in matte black, some raw —
but every edge shows the same raw striped core.

Cold overcast light, soft and directionless. Blue-grey shadows, warm tan wood.

Horizontal 3:2. 85 mm lens, f/5.6. The stripes run across the frame.

Photographic realism. No text, no watermark.
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
view, camera at seat height. Seamless warm grey backdrop, no horizon line.
Large soft light from the upper left, subtle fill from the right, soft
gradient shadow under the chair. Finish: natural birch.

Square 1:1, the chair centred with generous margin. 85 mm lens, f/8, sharp
throughout.

Birch plywood: the faces carry the finish, every cut edge shows the raw
laminated core as a striped tan band. Reproduce the chair in IMAGE 1 exactly
— same parts, same splay of the legs, same wrap of the back. No cushions, no
visible hardware. No text, no watermark.
```

**1 · detalle de la cuña**
```
IMAGE 1 = a CNC-cut birch plywood chair.

Extreme close-up of the wedge locking the through-tenon on the side frame of
the chair in IMAGE 1. The tenon emerges through the panel, the tapered wedge
is driven through it. Fill the frame with those two parts. The striped
plywood edges of tenon, wedge and panel are the subject.

Workshop bench, cold overcast light from the side, dust in the crevices.
Shallow depth of field, sharp on the wedge.

Square 1:1. 100 mm macro, f/4.

Reproduce the joint exactly as in IMAGE 1. No hands, no tools in frame, no
text, no watermark.
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
are legible. Seamless warm grey backdrop. Large soft light from the upper
left, soft gradient shadow beneath. Finish: natural birch.

Square 1:1, table centred with margin. 85 mm lens, f/8, sharp throughout.

Birch plywood: faces finished, every cut edge showing the striped raw core.
Reproduce the table in IMAGE 1 exactly — four legs, the pinwheel of the
frame, the four crosses in the top. No text, no watermark.
```

**1 · detalle de la cruceta**
```
IMAGE 1 = a CNC-cut birch plywood square table.

Extreme close-up, from above and slightly to the side, of one corner of the
table top where the cross-shaped mortise sits: the two tenons of the crossing
legs come up through it and finish flush with the surface, forming a cross of
end-grain plywood inside the square. Fill the frame with that corner.

Workshop light, cold and overcast, raking across the top so the flushness
reads. Shallow depth of field, sharp on the cross.

Square 1:1. 100 mm macro, f/5.6.

Reproduce the joint exactly as in IMAGE 1: two tenons meeting in the cross,
flush with the top. No text, no watermark.
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
shelves and vertical fins reads flat and even. Seamless warm grey backdrop,
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

Extreme close-up of one crossing where a vertical fin meets a shelf: the
half-lap slot, the two boards interlocking, the striped plywood edges of both
meeting at ninety degrees. Fill the frame with that intersection.

Workshop light, cold overcast, raking from the left so the shadow line in the
slot reads. Shallow depth of field.

Square 1:1. 100 mm macro, f/4.

Reproduce the joint exactly as in IMAGE 1 — a slotted half-lap, no screws, no
brackets, no dowels. No text, no watermark.
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
silhouette. Seamless warm grey backdrop, soft shadow beneath. Finish: natural
birch.

Square 1:1, bench centred, its full length in frame. 85 mm lens, f/8.

Birch plywood. Reproduce the bench in IMAGE 1 exactly: same number of ribs,
same spacing, same curve. Do not smooth the ribs into a solid mass. No text,
no watermark.
```

**1 · detalle del peine**
```
IMAGE 1 = a long CNC-cut birch plywood slatted bench.

Extreme close-up along the bench from IMAGE 1, camera almost at the level of
the seat and looking down the row of ribs, so they recede into the frame as a
comb of parallel plates with even gaps between them, and the two spines
threading through them are visible in the shadow underneath.

Workshop light, cold overcast, raking along the ribs so each one casts a thin
shadow on the next. Sharp on the third or fourth rib, the rest falling off.

Square 1:1. 85 mm lens, f/2.8.

Reproduce the rib spacing and the two spines exactly as in IMAGE 1. No text,
no watermark.
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
| Azul | life-4, mesa pata |

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

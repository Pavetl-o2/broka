// Corre el solver de juntas sobre los DXF y emite el armado resuelto en la
// convencion de broka: mm, X ancho, Y profundidad, Z alto, Z hacia arriba,
// origen en la esquina minima del mueble y z = 0 en el piso.
//
// NO CORRE EN ESTE REPO. Importa lib/cnc y lib/cncSolver de `mueble-calc`, que
// es donde vive el solver. Se copia a scripts/ de un clon de ese repo (rama
// claude/fix-cve-md-apply-zibftp) y se corre con `npx tsx scripts/broka.ts`;
// escribe lib/parametric/armado-cnc.json aqui. Vive en broka para que quede
// asentado de donde salio ese JSON, y por eso tsconfig excluye scripts/.
//
// El solver trabaja con Y hacia arriba (convenio de three), asi que aqui se
// cambia de ejes una sola vez:  cad = (x, -z, y).
import { readFileSync, writeFileSync } from "fs";
import { leerCorteDxf } from "../lib/cnc";
import { resolverArmado, alMundo, pisoDe, type Armadura, type Instancia, type Pose, type V3 } from "../lib/cncSolver";
import type { ContornoCnc } from "../lib/cnc";

const U = "/root/.claude/uploads/78ad7b00-7316-55f7-b0b0-07ebf12a018a";
// El cuarto de vuelta pone el ancho del mueble sobre X. El DXF no dice cual
// de las dos medidas horizontales es el "ancho" y cual el "fondo": eso lo
// decide el producto, no el archivo.
const JOBS: [string, string, boolean][] = [
  ["silla", `${U}/72ce7111-silla_limpia.dxf`, true],
  ["mesa", `${U}/5ab7262a-square_table.dxf`, false],
  ["banco", `${U}/8b7f5c0c-075y32po.dxf`, false],
];

let cuarto = false;
const aCad = (p: V3): V3 => (cuarto ? [p[2], p[0], p[1]] : [p[0], -p[2], p[1]]);

type Salida = {
  espesor: number;
  envolvente: [number, number, number];
  piezas: {
    nombre: string;
    espesor: number;
    contorno: [number, number][];
    huecos: [number, number][][];
    /** Centro de la caja del dibujo: el origen de la malla. */
    centro: [number, number];
  }[];
  instancias: { pieza: number; o: V3; u: V3; v: V3; w: V3 }[];
};

/**
 * El solver crece de forma codiciosa y se queda con el primer armado
 * consistente, que no siempre es el correcto: en la mesa acierta el lado de
 * los cuatro marcos pero a uno lo corre casi un metro sobre su propio eje.
 *
 * Cuando una misma pieza se repite alrededor de un panel, las copias buenas
 * ya dicen cual es la simetria. Aqui se toma una que caiga dentro de la huella
 * del panel y se rehacen las demas girandola en cuartos de vuelta sobre el eje
 * vertical del panel. No inventa una colocacion: propaga la que el solver ya
 * encontro.
 */
function cerrarSimetria(arm: Armadura, piezas: ContornoCnc[]) {
  const area = (id: string) => piezas.find((p) => p.id === id)?.areaMm2 ?? 0;
  const orden = [...arm.instancias].sort((a, b) => area(b.piezaId) - area(a.piezaId));
  const panel = orden[0];
  // Solo aplica a la familia "panel + perimetrales": una pieza claramente mayor
  // y el resto colgando de ella. En un banco de costillas iguales no hay panel
  // que haga de referencia, y las costillas SI sobresalen con razon.
  if (!panel || orden.length < 2 || area(panel.piezaId) < 2 * area(orden[1].piezaId)) return;

  const huella = (inst: Instancia) => {
    const pz = piezas.find((p) => p.id === inst.piezaId)!;
    let lo = [Infinity, Infinity];
    let hi = [-Infinity, -Infinity];
    for (const q of pz.ext) {
      const w = alMundo(inst.pose, q as [number, number]);
      // El solver trabaja con Y arriba: la planta es (x, z).
      for (const [k, c] of [[0, w[0]], [1, w[2]]] as [number, number][]) {
        lo[k] = Math.min(lo[k], c);
        hi[k] = Math.max(hi[k], c);
      }
    }
    return { lo, hi };
  };

  const hp = huella(panel);
  const cx = (hp.lo[0] + hp.hi[0]) / 2;
  const cz = (hp.lo[1] + hp.hi[1]) / 2;
  const dentro = (i: Instancia) => {
    const h = huella(i);
    const m = 40;
    return h.lo[0] >= hp.lo[0] - m && h.hi[0] <= hp.hi[0] + m &&
           h.lo[1] >= hp.lo[1] - m && h.hi[1] <= hp.hi[1] + m;
  };

  for (const inst of arm.instancias) {
    if (inst === panel || dentro(inst)) continue;
    const h = huella(inst);
    // Se corrige SOLO el eje que se desborda, y llevando su centro al del
    // panel. El lado y la orientacion los acerto el solver; lo que fallo es
    // cuanto la deslizo a lo largo de su propio eje.
    const d: [number, number] = [0, 0];
    for (const k of [0, 1] as const) {
      const c = [cx, cz][k];
      if (h.lo[k] < hp.lo[k] - 40 || h.hi[k] > hp.hi[k] + 40) {
        d[k] = c - (h.lo[k] + h.hi[k]) / 2;
      }
    }
    if (!d[0] && !d[1]) continue;
    inst.pose = { ...inst.pose, o: [inst.pose.o[0] + d[0], inst.pose.o[1], inst.pose.o[2] + d[1]] };
    console.log(
      `   ${inst.piezaId}: se salia de la huella del panel; recentrada ` +
        `${Math.round(Math.hypot(d[0], d[1]))} mm sobre su eje`
    );
  }
}

const out: Record<string, Salida> = {};

for (const [nombre, ruta, giro] of JOBS) {
  cuarto = giro;
  const lec = leerCorteDxf(readFileSync(ruta, "utf8"));
  const espGlobal = lec.espesor ?? 18;
  const arm = resolverArmado(lec.piezas, espGlobal);
  const piso = pisoDe(arm, lec.piezas, espGlobal);

  const idx = new Map(lec.piezas.map((p, i) => [p.id, i]));
  cerrarSimetria(arm, lec.piezas);

  // Envolvente del mueble armado, en cad, para poder escalarlo despues.
  let lo: V3 = [Infinity, Infinity, Infinity];
  let hi: V3 = [-Infinity, -Infinity, -Infinity];
  for (const inst of arm.instancias) {
    const pieza = lec.piezas[idx.get(inst.piezaId)!];
    const e = (pieza.espesor ?? espGlobal) / 2;
    for (const q of pieza.ext) {
      const base = alMundo(inst.pose, q as [number, number]);
      for (const s of [-1, 1]) {
        const p = aCad([
          base[0] + inst.pose.w[0] * e * s,
          base[1] + inst.pose.w[1] * e * s,
          base[2] + inst.pose.w[2] * e * s,
        ]);
        for (let k = 0; k < 3; k++) {
          lo[k] = Math.min(lo[k], p[k]);
          hi[k] = Math.max(hi[k], p[k]);
        }
      }
    }
  }
  // z = 0 al piso que calculo el solver; x, y a la esquina minima.
  const zPiso = aCad([0, piso, 0])[2];
  const off: V3 = [-lo[0], -lo[1], -zPiso];

  const r = (n: number) => Math.round(n * 1000) / 1000;
  out[nombre] = {
    espesor: espGlobal,
    envolvente: [r(hi[0] - lo[0]), r(hi[1] - lo[1]), r(hi[2] - zPiso)],
    piezas: lec.piezas.map((p) => ({
      nombre: p.id,
      espesor: p.espesor ?? espGlobal,
      contorno: p.ext.map((q) => [r(q[0]), r(q[1])] as [number, number]),
      huecos: (p.huecos ?? []).map((h) =>
        h.map((q) => [r(q[0]), r(q[1])] as [number, number])
      ),
      centro: [r((p.bbox.x0 + p.bbox.x1) / 2), r((p.bbox.y0 + p.bbox.y1) / 2)],
    })),
    instancias: arm.instancias.map((inst) => {
      const P: Pose = inst.pose;
      const o = aCad(P.o);
      return {
        pieza: idx.get(inst.piezaId)!,
        o: [r(o[0] + off[0]), r(o[1] + off[1]), r(o[2] + off[2])] as V3,
        u: aCad(P.u).map(r) as V3,
        v: aCad(P.v).map(r) as V3,
        w: aCad(P.w).map(r) as V3,
      };
    }),
  };

  console.log(
    `${nombre}: ${arm.instancias.length} instancias de ${lec.piezas.length} piezas, ` +
      `envolvente ${out[nombre].envolvente.map(Math.round).join(" x ")} mm, ` +
      `esp ${espGlobal}, sueltas ${arm.sueltas.length}`
  );
}

writeFileSync(
  "/home/user/broka/lib/parametric/armado-cnc.json",
  JSON.stringify(out, null, 1) + "\n"
);
console.log("escrito lib/parametric/armado-cnc.json");

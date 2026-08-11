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

  // Los perimetrales: cuatro piezas de la misma area. Que el signo del area
  // cambie entre ellas solo dice que el DXF las traza al reves, no que sean
  // distintas: es una sola pieza repetida cuatro veces.
  const perim = arm.instancias.filter(
    (i) => i !== panel && Math.abs(Math.abs(area(i.piezaId)) - Math.abs(area(orden[1].piezaId))) < 100
  );
  if (perim.length !== 4) return;

  const giraY = (p: Pose, t: number): Pose => {
    const co = Math.cos(t), si = Math.sin(t);
    const rd = (d: V3): V3 => [d[0] * co + d[2] * si, d[1], -d[0] * si + d[2] * co];
    const ro = (q: V3): V3 => {
      const x = q[0] - cx, z = q[2] - cz;
      return [cx + x * co + z * si, q[1], cz - x * si + z * co];
    };
    return { o: ro(p.o), u: rd(p.u), v: rd(p.v), w: rd(p.w) };
  };

  // Semilla: la copia que el solver dejo mas centrada sobre el panel.
  const desvio = (i: Instancia) => {
    const h = huella(i);
    return Math.abs((h.lo[0] + h.hi[0]) / 2 - cx) + Math.abs((h.lo[1] + h.hi[1]) / 2 - cz);
  };
  const semilla = [...perim].sort((a, b) => desvio(a) - desvio(b))[0];

  // Se centra sobre el eje en el que corre, que es donde el solver falla: el
  // lado y la orientacion los acierta, cuanto la desliza no.
  const h0 = huella(semilla);
  const largoX = h0.hi[0] - h0.lo[0] > h0.hi[1] - h0.lo[1];
  const eje = largoX ? 0 : 1;
  const d = [cx, cz][eje] - (h0.lo[eje] + h0.hi[eje]) / 2;
  const base: Pose = {
    ...semilla.pose,
    o: [semilla.pose.o[0] + (eje === 0 ? d : 0), semilla.pose.o[1], semilla.pose.o[2] + (eje === 1 ? d : 0)],
  };

  // Molinete: las cuatro son la misma pieza girada un cuarto de vuelta cada
  // vez, y asi la espiga de cada pata entra en la cuna de la siguiente.
  perim.forEach((inst, k) => {
    inst.piezaId = semilla.piezaId;
    inst.pose = giraY(base, (k * Math.PI) / 2);
  });
  console.log(
    `   ${semilla.piezaId} x4 en molinete; la semilla se recentro ${Math.round(d)} mm sobre su eje`
  );
}

/**
 * MESA: se arma del plano, no del solver.
 *
 * `armadomesa.md` documenta por que el solver falla en este archivo y da las
 * medidas correctas. El inferidor de espesor mide el tramo recto mas corto de
 * la mortaja y encuentra 23.8 mm, que no es el ancho del brazo sino una pared
 * acortada por el radio de la fresa: el brazo entero mide 30. De ese error
 * cuelgan los otros dos -abre las patas en abanico y las alarga- y ademas
 * cierra solo dos de las cuatro medias maderas, asi que la cuarta pata queda
 * a 870 mm de la mesa.
 *
 * Lo que sigue no interpreta nada: son las cotas del dibujo, y cada una se
 * comprueba contra el DXF en el arranque.
 *
 *   espesor 30, patas A PLOMO, alto 730 = hombro 700 + tablero 30
 *   espigas en un cuadrado de 830, a 165 de cada canto de la cubierta
 *   molinete simetrico a 90: cada pata corre de su espiga a la caja de la
 *   vecina -830- y sigue 171 mas hasta su pie, que cae bajo el canto
 */
const MESA = {
  espesor: 30,
  alto: 730,
  /** Lado del cuadrado de espigas. */
  cuadrado: 830,
};

function armarMesa(piezas: ContornoCnc[]): Salida {
  const t = MESA.espesor;
  const r = (n: number) => Math.round(n * 1000) / 1000;
  const norm = (p: ContornoCnc) =>
    (p.ext as [number, number][]).map(([x, y]) => [r(x - p.bbox.x0), r(y - p.bbox.y0)] as [number, number]);

  const panel = piezas.find((p) => p.bbox.x1 - p.bbox.x0 > 1150)!;
  // La pata canonica: larguero arriba (v = 0, de donde sale la espiga) y pie
  // abajo. Las otras tres son esta misma girada un cuarto de vuelta.
  const patas = piezas.filter((p) => Math.abs(p.bbox.x1 - p.bbox.x0 - 1121.5) < 3);
  const anchoEn = (pts: [number, number][], y: number) => {
    const us = pts.filter((q) => Math.abs(q[1] - y) < 1.5).map((q) => q[0]);
    return us.length ? Math.max(...us) - Math.min(...us) : 0;
  };
  const canonica = patas
    .map(norm)
    .find((pts) => anchoEn(pts, 0) >= anchoEn(pts, Math.max(...pts.map((q) => q[1]))))!;

  /**
   * Los dos extremos que suben al tablero, leidos del contorno.
   *
   * Cada pata remata en DOS espigas, no en una: la de un extremo es maciza y
   * la del otro viene partida al medio por una ranura de 30. En la esquina se
   * cruzan la maciza de una pata y la ranurada de su vecina, y ese cruce es la
   * cruceta que cae dentro de la mortaja en cruz del tablero. Por eso la cruz
   * tiene dos brazos y cada pata ocupa uno.
   *
   * Se miden del dibujo y no se fijan a mano: las cuatro patas del nesting son
   * la misma pieza, pero dos vienen volteadas, y entonces la espiga maciza cae
   * en u = 85 o en u = 1036.5 segun cual toque.
   */
  const tramosArriba = (() => {
    const segs: [number, number][] = [];
    for (let i = 0; i < canonica.length; i++) {
      const a = canonica[i];
      const b = canonica[(i + 1) % canonica.length];
      if (Math.abs(a[1]) < 1.5 && Math.abs(b[1]) < 1.5) {
        segs.push([Math.min(a[0], b[0]), Math.max(a[0], b[0])]);
      }
    }
    segs.sort((x, y) => x[0] - y[0]);
    const runs: [number, number][] = [];
    for (const s of segs) {
      const u = runs[runs.length - 1];
      if (u && s[0] <= u[1] + 1) u[1] = Math.max(u[1], s[1]);
      else runs.push([...s] as [number, number]);
    }
    return runs;
  })();

  const largo = (s: [number, number]) => s[1] - s[0];
  const maciza = tramosArriba.find((s) => Math.abs(largo(s) - 89) < 3);
  const orejas = tramosArriba.filter((s) => Math.abs(largo(s) - 29.5) < 3);
  if (!maciza || orejas.length !== 2) {
    throw new Error(`no reconoci las espigas: tramos ${tramosArriba.map(largo).map((n) => n.toFixed(1)).join(", ")}`);
  }
  const uMaciza = (maciza[0] + maciza[1]) / 2;
  const uRanurada = (orejas[0][0] + orejas[1][1]) / 2;
  const paso = uRanurada - uMaciza;
  if (Math.abs(Math.abs(paso) - MESA.cuadrado) > 2) {
    throw new Error(`espiga a espiga ${paso.toFixed(1)}, el plano dice ${MESA.cuadrado}`);
  }

  const anchoPanel = panel.bbox.x1 - panel.bbox.x0;
  const profPanel = panel.bbox.y1 - panel.bbox.y0;
  const q = MESA.cuadrado / 2;

  // Comprobaciones del plano: si el DXF cambia, esto avisa en vez de mentir.
  const vuelo = (anchoPanel - MESA.cuadrado) / 2;
  if (Math.abs(vuelo - 165) > 2) throw new Error(`vuelo ${vuelo.toFixed(1)}, el plano dice 165`);

  const esquinas: [number, number][] = [[-q, q], [q, q], [q, -q], [-q, -q]];
  const dirs: [number, number][] = [[1, 0], [0, -1], [-1, 0], [0, 1]];

  const instancias: Salida["instancias"] = [
    // Cubierta: acostada, con su cara de arriba a 730. El espesor se reparte a
    // los dos lados de w, asi que el plano medio va a 730 - 30/2.
    {
      pieza: 0,
      o: [r(-anchoPanel / 2), r(-profPanel / 2), r(MESA.alto - t / 2)],
      u: [1, 0, 0],
      v: [0, 1, 0],
      w: [0, 0, 1],
    },
  ];

  // u avanza de la espiga maciza hacia la ranurada, que es de una esquina a la
  // siguiente. Si el dibujo las trae al reves, se recorre u en sentido opuesto.
  const sgn = Math.sign(paso);
  esquinas.forEach(([ex, ey], k) => {
    const [dx, dy] = dirs[k].map((c) => c * sgn) as [number, number];
    instancias.push({
      pieza: 1,
      // Imagen del (0,0) del dibujo: desde la espiga maciza se retrocede su
      // cota, y v crece hacia abajo desde el canto de arriba.
      o: [r(ex - dx * uMaciza), r(ey - dy * uMaciza), MESA.alto],
      u: [dx, dy, 0],
      v: [0, 0, -1],
      w: [-dy, dx, 0],
    });
  });

  const pieza = (nombre: string, pts: [number, number][], huecos: [number, number][][]) => ({
    nombre,
    espesor: t,
    contorno: pts,
    huecos,
    centro: [
      r((Math.min(...pts.map((p) => p[0])) + Math.max(...pts.map((p) => p[0]))) / 2),
      r((Math.min(...pts.map((p) => p[1])) + Math.max(...pts.map((p) => p[1]))) / 2),
    ] as [number, number],
  });

  // Comprobaciones finales del plano, sobre el armado ya colocado. Si alguna
  // no cierra es que el DXF cambio y este armado dejo de describirlo.
  const enU = (i: Salida["instancias"][0], u: number) => [i.o[0] + i.u[0] * u, i.o[1] + i.u[1] * u];
  const espigas = instancias.slice(1).map((i) => enU(i, uMaciza));
  // La ranurada de cada pata tiene que caer sobre la maciza de la vecina: ese
  // encuentro es la cruceta, y es justo lo que faltaba comprobar.
  instancias.slice(1).forEach((i, k) => {
    const ran = enU(i, uRanurada);
    const vec = espigas[(k + 1) % 4];
    const d = Math.hypot(ran[0] - vec[0], ran[1] - vec[1]);
    if (d > 2) throw new Error(`la espiga ranurada de la pata ${k + 1} cae a ${d.toFixed(1)} mm de la maciza de su vecina`);
  });
  console.log(`   ok cruceta: las cuatro ranuradas caen sobre la maciza vecina`);
  const lado = Math.hypot(espigas[0][0] - espigas[1][0], espigas[0][1] - espigas[1][1]);
  const diag = Math.hypot(espigas[0][0] - espigas[2][0], espigas[0][1] - espigas[2][1]);
  const revisa = (que: string, val: number, esperado: number, tol: number) => {
    if (Math.abs(val - esperado) > tol) throw new Error(`${que}: ${val.toFixed(1)}, el plano dice ${esperado}`);
    console.log(`   ok ${que}: ${val.toFixed(1)} mm`);
  };
  revisa("lado del cuadrado de espigas", lado, 830, 3);
  revisa("diagonal entre espigas", diag, 1174, 3);
  revisa("vuelo de la cubierta por lado", vuelo, 165, 2);
  revisa("alto terminado", MESA.alto, 730, 0);
  revisa("cara de arriba de la cubierta", instancias[0].o[2] + t / 2, 730, 0.01);

  const pataOrig = patas.find((p) => norm(p) === canonica) ?? patas[0];
  return {
    espesor: t,
    envolvente: [r(anchoPanel), r(profPanel), MESA.alto],
    piezas: [
      pieza("Cubierta", norm(panel), panel.huecos.map((h) =>
        (h as [number, number][]).map(([x, y]) => [r(x - panel.bbox.x0), r(y - panel.bbox.y0)] as [number, number]))),
      pieza("Pata", canonica, pataOrig.huecos.map((h) =>
        (h as [number, number][]).map(([x, y]) => [r(x - pataOrig.bbox.x0), r(y - pataOrig.bbox.y0)] as [number, number]))),
    ],
    instancias,
  };
}

const out: Record<string, Salida> = {};

for (const [nombre, ruta, giro] of JOBS) {
  cuarto = giro;
  const lec = leerCorteDxf(readFileSync(ruta, "utf8"));
  const espGlobal = lec.espesor ?? 18;
  const arm = resolverArmado(lec.piezas, espGlobal);
  const piso = pisoDe(arm, lec.piezas, espGlobal);

  if (nombre === "mesa") {
    out[nombre] = armarMesa(lec.piezas);
    const e = out[nombre].envolvente.map(Math.round).join(" x ");
    console.log(`mesa: ${out[nombre].instancias.length} instancias del plano, envolvente ${e} mm, esp ${MESA.espesor}`);
    continue;
  }

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

export type PanelKey = 'abedul' | 'mdf';

export type FinishKey = 'abedul' | 'blanco' | 'negro' | 'azul';

/**
 * Muebles en catálogo. Uno por armado probado.
 *
 * Para sumar otro: se corre `scripts/armado-cnc.ts` con su DXF, se agrega la
 * clave aquí y su entrada en `data/products.json`. Nada más. Un tipo sin
 * armado no compila, que es justamente lo que se quiere.
 */
export type MuebleType = 'silla' | 'mesa' | 'librero' | 'banco';

export type Categoria = 'Sillas' | 'Mesas' | 'Libreros' | 'Bancos';

export type Dims = { w: number; d: number; h: number };

export type Producto = {
  id: string;
  nameES: string;
  category: Categoria;
  /** Elige el armado que genera geometría, costo y despiece. */
  type: MuebleType;
  materialES: string;
  /** Determina el precio de hoja. */
  panel: PanelKey;
  /** MXN fijos. */
  herraje: number;
  finishes: FinishKey[];
  /**
   * La medida del mueble, en mm. Una sola y no negociable: es la del DXF con el
   * que se cortó y se probó el armado. Cambiarla sin un DXF nuevo detrás daría
   * un render y un precio que el taller no puede cumplir.
   */
  medida: Dims;
  descriptionES: string;
  /** Descripción de la foto que va en cada hueco de la galería. */
  images: string[];
  /** '/models/mesa-llano-160.glb' — opcional, hoy la geometría es paramétrica. */
  model3d?: string;
};

/**
 * Una pieza del despiece. Alimenta 3D, costo y DXF.
 *
 * Convención de `mueble-calc`: cada pieza es una caja alineada a ejes.
 *
 *   X = ancho, Y = profundidad, Z = alto  ·  Z hacia arriba
 *   px, py, pz = esquina MÍNIMA de la pieza
 *   y = 0 es el FRENTE del mueble; y crece hacia atrás
 *   z = 0 es el piso
 *
 * Todo en milímetros. El eje menor de los tres es el espesor: no se declara
 * aparte, se deduce. Así una pieza no puede contradecirse a sí misma.
 */
export type Part = {
  nombre: string;
  /** Agrupa piezas iguales en el despiece. */
  grupo: string;
  sx: number;
  sy: number;
  sz: number;
  px: number;
  py: number;
  pz: number;
  /**
   * Contorno de la cara, en mm desde la esquina mínima, sobre los dos ejes
   * mayores (orden x → y → z saltando el del espesor). Sin perfil la pieza es
   * la caja entera; con perfil se extruye ese contorno a lo largo del espesor.
   *
   * La caja manda igual: encuadre, costo y anidado siguen leyendo sx/sy/sz. El
   * perfil solo decide qué se dibuja dentro. Es lo que deja representar la A de
   * la silla o la costilla curva de la banca sin salirse de la convención.
   */
  perfil?: Punto2[];
  /** Calados pasantes dentro del perfil, en las mismas coordenadas. */
  huecos?: Punto2[][];
  /**
   * Colocación completa, cuando la pieza no va a escuadra. Viene del solver de
   * juntas: no hay ángulos que componer, la base ya está resuelta.
   *
   * Con pose, `perfil` y `huecos` están en las coordenadas del dibujo de corte
   * y es la pose la que los lleva al mueble; sx/sy/sz siguen siendo el tablero
   * plano, que es lo que miran el costo y el anidado.
   */
  pose?: Pose;
};

export type V3 = [number, number, number];

/**
 * Sitio de una pieza en el espacio, en la convención de `mueble-calc`:
 * dónde cae el (0,0) del dibujo y en qué se convierten sus ejes.
 */
export type Pose = {
  /** Dónde cae el (0,0) del dibujo. */
  o: V3;
  /** Imagen del eje X del dibujo. */
  u: V3;
  /** Imagen del eje Y del dibujo. */
  v: V3;
  /** Normal de la cara: el tablero ocupa ±espesor/2 en esta dirección. */
  w: V3;
};

/** Punto sobre la cara de una pieza, en mm desde su esquina mínima. */
export type Punto2 = [number, number];

export type CostBreakdown = {
  total: number;
  hojas: number;
  /** m² de tablero. */
  area: number;
  /** Metros lineales de trayectoria de ruteo. */
  perim: number;
  cHojas: number;
  cRuteo: number;
  cAcab: number;
  herraje: number;
  piezas: number;
};

export type CartLine = {
  /** producto|acabado — identidad de la línea. */
  key: string;
  id: string;
  n: string;
  ph: string;
  finish: FinishKey;
  finishName: string;
  dimsLabel: string;
  /** Precio unitario sin IVA. El servidor lo recalcula antes de cobrar. */
  unit: number;
  qty: number;
};

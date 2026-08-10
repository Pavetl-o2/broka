export type PanelKey = 'abedul' | 'mdf';

export type FinishKey = 'roble' | 'nogal' | 'encino' | 'abedul' | 'blanco' | 'grafito';

export type MuebleType = 'silla' | 'mesa' | 'librero' | 'banco' | 'escritorio' | 'buro';

export type Categoria =
  | 'Sillas'
  | 'Mesas'
  | 'Libreros'
  | 'Bancos'
  | 'Escritorios'
  | 'Casegoods';

export type Size = {
  id: string;
  nameES: string;
  /** Milímetros. */
  w: number;
  d: number;
  h: number;
};

export type Dims = { w: number; d: number; h: number };

/** Límites de medida especial, en milímetros. */
export type Rango = { w: [number, number]; d: [number, number]; h: [number, number] };

export type Producto = {
  id: string;
  nameES: string;
  category: Categoria;
  /** Elige el partList que genera geometría, costo y despiece. */
  type: MuebleType;
  materialES: string;
  /** Determina el precio de hoja. */
  panel: PanelKey;
  /** MXN fijos. */
  herraje: number;
  finishes: FinishKey[];
  sizes: Size[];
  rango: Rango;
  descriptionES: string;
  /** Descripción de la foto que va en cada hueco de la galería. */
  images: string[];
  /** '/models/mesa-llano-160.glb' — opcional, hoy la geometría es paramétrica. */
  model3d?: string;
};

/** Una pieza del despiece. Alimenta 3D, costo y DXF. */
export type Part = {
  nombre: string;
  /** Milímetros. */
  w: number;
  h: number;
  t: number;
  /** Eje normal de la pieza una vez montada. */
  axis: 'x' | 'y' | 'z';
  pos: [number, number, number];
  routed: boolean;
  hole?: { w: number; h: number; y: number };
};

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
  /** producto|acabado|talla — identidad de la línea. */
  key: string;
  id: string;
  n: string;
  ph: string;
  finish: FinishKey;
  sizeId: string;
  finishName: string;
  sizeName: string;
  dimsLabel: string;
  /** Precio unitario sin IVA. El servidor lo recalcula antes de cobrar. */
  unit: number;
  qty: number;
};

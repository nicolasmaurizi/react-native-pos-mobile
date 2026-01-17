import type { Articulo } from "../articulos/types";

export type ItemFactura = {
  articuloId: string;

  // snapshot del artículo (por si cambia el precio después)
  codigo: string;
  descripcion: string;
  precio: number;
  iva: number;

  cantidad: number;
};

export type IVAArticulo = 10.5 | 21;

export type Articulo = {
  id: string;
  codigo: string;      // SKU opcional
  descripcion: string;
  precio: number;       // ARS
   iva: IVAArticulo; 
  unidad?: string;      // "u", "kg", "lt"
  activo: 0 | 1;        // soft delete / ocultar
  createdAt: string;
  updatedAt: string;
};

export type ArticuloDraft = Omit<Articulo, "id" | "createdAt" | "updatedAt">;

export type Articulo = {
  id: string;
  codigo?: string;      // SKU opcional
  nombre: string;
  precio: number;       // ARS
  stock?: number;
  unidad?: string;      // "u", "kg", "lt"
  activo: 0 | 1;        // soft delete / ocultar
  createdAt: string;
  updatedAt: string;
};

export type ArticuloDraft = Omit<Articulo, "id" | "createdAt" | "updatedAt">;

export type Cliente = {
  id: string;
  nombre: string;
  cuit?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  createdAt: string;
  updatedAt: string;
};

export type ClienteDraft = Omit<Cliente, "id" | "createdAt" | "updatedAt">;

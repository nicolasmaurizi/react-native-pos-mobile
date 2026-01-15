export type CondicionIVAId = 1 | 4 | 5 | 6;

export type Cliente = {
  id: string;
  cuit: string;                 
  razonSocial: string;          
  condicionIVAId: CondicionIVAId;
  telefono?: string;
  email?: string;
  direccion?: string;
  createdAt: string;
  updatedAt: string;
};

export type ClienteDraft = Omit<Cliente, "id" | "createdAt" | "updatedAt">;

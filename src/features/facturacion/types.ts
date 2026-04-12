export type IVAArticulo = 10.5 | 21;

export type Emisor = {
  cuit: string;
  razonSocial: string;
  puntoDeVenta: string;
  idFEAPI?: string | null;
  domicilioComercial?: string | null;
};

export type Cliente = {
  id: string;
  razonSocial: string;
  cuit: string; // si puede venir vacío, dejalo string igual
  condicionIVAId?: number;
  direccion?: string;
};

export type ItemFactura = {
  articuloId: string;
  codigo?: string;
  descripcion: string;
  cantidad: number;
  precio: number;
  iva: IVAArticulo;
  subtotal: number;
};

export type FacturaPayload = {
  emisor: Emisor;
  cliente: Cliente;
  items: ItemFactura[];
  totales: {
    cantidad: number;
    total: number;
  };
  createdAt: string; // ISO
};

export type FacturaResponseOk = {
  ok: true;
  numero: string;       // "0001-00000001"
  cae?: string;
  vtoCae?: string;
  datosQR: string;      // lo que te devuelve tu API para QR AFIP
};

export type FacturaResponseErr = {
  ok: false;
  message?: string;
  details?: any;
};

export type FacturaResponse = FacturaResponseOk | FacturaResponseErr;

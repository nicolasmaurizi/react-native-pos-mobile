import { db } from "../../db/sqlite";

export type CondicionIVAId = 1 | 4 | 5 | 6;

export type EmisorSettings = {
  cuit: string;
  razonSocial: string;
  condicionIVAId: CondicionIVAId;
  domicilioComercial: string;
  puntoDeVenta: string;
  nombreFantasia: string;
  iniActividad: string; // YYYY-MM-DD
  idFEAPI: string;
};


const empty: EmisorSettings = {
  cuit: "",
  razonSocial: "",
  condicionIVAId: 6, // Monotributo por default
  domicilioComercial: "",
  puntoDeVenta: "",
  nombreFantasia: "",
  iniActividad: "",
  idFEAPI: "",
};


export function getEmisor(): EmisorSettings {
  const row = db.getFirstSync<any>(`SELECT * FROM settings_emisor WHERE id = 1`);
  if (!row) return empty;
  return {
    cuit: row.cuit ?? "",
    razonSocial: row.razonSocial ?? "",
    condicionIVAId: (row.condicionIVA ?? 6) as CondicionIVAId,
    domicilioComercial: row.domicilioComercial ?? "",
    puntoDeVenta: row.puntoDeVenta ?? "",
    nombreFantasia: row.nombreFantasia ?? "",
    iniActividad: row.iniActividad ?? "",
    idFEAPI: row.idFEAPI ?? "",
  };
}

export function saveEmisor(s: EmisorSettings) {
  db.runSync(
    `UPDATE settings_emisor SET
      cuit=?, razonSocial=?, condicionIVA=?, domicilioComercial=?,
      puntoDeVenta=?, nombreFantasia=?, iniActividad=?, idFEAPI=?, updatedAt=?
     WHERE id=1`,
    [
      s.cuit,
      s.razonSocial,
      s.condicionIVAId,
      s.domicilioComercial,
      s.puntoDeVenta,
      s.nombreFantasia,
      s.iniActividad,
      s.idFEAPI,
      new Date().toISOString(),
    ]
  );
}



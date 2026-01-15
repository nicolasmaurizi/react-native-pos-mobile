import { db } from "../../db/sqlite";
import type { Cliente } from "./types";

export function listClientes(search?: string): Cliente[] {
  const q = search?.trim();
  if (!q) {
    return db.getAllSync<Cliente>(`SELECT * FROM clientes ORDER BY razonSocial COLLATE NOCASE ASC`);
  }
  return db.getAllSync<Cliente>(
    `SELECT * FROM clientes
     WHERE razonSocial LIKE ? OR cuit LIKE ?
     ORDER BY razonSocial COLLATE NOCASE ASC`,
    [`%${q}%`, `%${q}%`]
  );
}

export function upsertCliente(c: Cliente) {
  db.runSync(
    `INSERT INTO clientes (id, cuit, razonSocial, condicionIVAId, telefono, email, direccion, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       cuit=excluded.cuit,
       razonSocial=excluded.razonSocial,
       condicionIVAId=excluded.condicionIVAId,
       telefono=excluded.telefono,
       email=excluded.email,
       direccion=excluded.direccion,
       updatedAt=excluded.updatedAt`,
    [
      c.id,
      c.cuit,
      c.razonSocial,
      c.condicionIVAId,
      c.telefono ?? null,
      c.email ?? null,
      c.direccion ?? null,
      c.createdAt,
      c.updatedAt,
    ]
  );
}

export function deleteCliente(id: string) {
  db.runSync(`DELETE FROM clientes WHERE id = ?`, [id]);
}

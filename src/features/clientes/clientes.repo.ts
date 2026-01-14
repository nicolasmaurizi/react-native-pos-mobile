import { db } from "../../db/sqlite";
import type { Cliente } from "./types";

export function listClientes(search?: string): Cliente[] {
  const q = search?.trim();
  if (!q) {
    return db.getAllSync<Cliente>(`SELECT * FROM clientes ORDER BY nombre COLLATE NOCASE ASC`);
  }
  return db.getAllSync<Cliente>(
    `SELECT * FROM clientes
     WHERE nombre LIKE ? OR cuit LIKE ?
     ORDER BY nombre COLLATE NOCASE ASC`,
    [`%${q}%`, `%${q}%`]
  );
}

export function upsertCliente(c: Cliente) {
  db.runSync(
    `INSERT INTO clientes (id, nombre, cuit, telefono, email, direccion, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       nombre=excluded.nombre,
       cuit=excluded.cuit,
       telefono=excluded.telefono,
       email=excluded.email,
       direccion=excluded.direccion,
       updatedAt=excluded.updatedAt`,
    [
      c.id,
      c.nombre,
      c.cuit ?? null,
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

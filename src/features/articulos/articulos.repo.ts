import { db } from "../../db/sqlite";
import type { Articulo } from "./types";

export function listArticulos(search?: string, onlyActive = true): Articulo[] {
  const q = search?.trim();
  const activeWhere = onlyActive ? "AND activo = 1" : "";

  if (!q) {
    return db.getAllSync<Articulo>(
      `SELECT * FROM articulos WHERE 1=1 ${activeWhere}
       ORDER BY nombre COLLATE NOCASE ASC`
    );
  }

  return db.getAllSync<Articulo>(
    `SELECT * FROM articulos
     WHERE (nombre LIKE ? OR codigo LIKE ?) ${activeWhere}
     ORDER BY nombre COLLATE NOCASE ASC`,
    [`%${q}%`, `%${q}%`]
  );
}

export function upsertArticulo(a: Articulo) {
  db.runSync(
    `INSERT INTO articulos (id, codigo, nombre, precio, stock, unidad, activo, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       codigo=excluded.codigo,
       nombre=excluded.nombre,
       precio=excluded.precio,
       stock=excluded.stock,
       unidad=excluded.unidad,
       activo=excluded.activo,
       updatedAt=excluded.updatedAt`,
    [
      a.id,
      a.codigo ?? null,
      a.nombre,
      a.precio,
      a.stock ?? null,
      a.unidad ?? null,
      a.activo,
      a.createdAt,
      a.updatedAt,
    ]
  );
}

export function softDeleteArticulo(id: string) {
  db.runSync(`UPDATE articulos SET activo = 0, updatedAt = ? WHERE id = ?`, [
    new Date().toISOString(),
    id,
  ]);
}

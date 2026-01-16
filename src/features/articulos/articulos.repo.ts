import { db } from "../../db/sqlite";
import type { Articulo } from "./types";

export function listArticulos(search = ""): Articulo[] {
  const q = search.trim();

  if (!q) {
    return db.getAllSync<Articulo>(`
      SELECT * FROM articulos
      ORDER BY descripcion COLLATE NOCASE ASC
    `);
  }

  return db.getAllSync<Articulo>(
    `SELECT * FROM articulos
     WHERE descripcion LIKE ? OR codigo LIKE ?
     ORDER BY descripcion COLLATE NOCASE ASC`,
    [`%${q}%`, `%${q}%`]
  );
}


export function upsertArticulo(a: Articulo) {
  db.runSync(
    `INSERT INTO articulos (id, codigo,descripcion, precio, iva, activo, createdAt, updatedAt)
     VALUES (?,?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
     codigo=excluded.codigo,
       descripcion=excluded.descripcion,
       precio=excluded.precio,
       iva=excluded.iva,
       activo=excluded.activo,
       updatedAt=excluded.updatedAt`,
    [a.id, a.codigo, a.descripcion, a.precio, a.iva, a.activo ? 1 : 0, a.createdAt, a.updatedAt]
  );
}

export function deleteArticulo(id: string) {
  db.runSync(`DELETE FROM articulos WHERE id = ?`, [id]);
}


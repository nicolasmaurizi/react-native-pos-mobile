import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("pos.db");

export function initDb() {
  db.execSync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS clientes (
      id TEXT PRIMARY KEY NOT NULL,
      nombre TEXT NOT NULL,
      cuit TEXT,
      telefono TEXT,
      email TEXT,
      direccion TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_clientes_nombre ON clientes(nombre);
  `);

  db.execSync(`
  CREATE TABLE IF NOT EXISTS articulos (
    id TEXT PRIMARY KEY NOT NULL,
    codigo TEXT,
    nombre TEXT NOT NULL,
    precio REAL NOT NULL,
    stock REAL,
    unidad TEXT,
    activo INTEGER NOT NULL DEFAULT 1,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_articulos_nombre ON articulos(nombre);
  CREATE INDEX IF NOT EXISTS idx_articulos_codigo ON articulos(codigo);
`);

db.execSync(`
  CREATE TABLE IF NOT EXISTS settings_emisor (
    id INTEGER PRIMARY KEY NOT NULL DEFAULT 1,
    cuit TEXT,
    razonSocial TEXT,
    condicionIVA TEXT,
    domicilioComercial TEXT,
    puntoDeVenta TEXT,
    nombreFantasia TEXT,
    iniActividad TEXT,
    idFEAPI TEXT,
    updatedAt TEXT
  );

  INSERT OR IGNORE INTO settings_emisor (id) VALUES (1);
`);


}

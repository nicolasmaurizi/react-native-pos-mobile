import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("pos.db");

export function initDb() {
// clientes 
db.execSync(`
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS clientes (
    id TEXT PRIMARY KEY NOT NULL,
    cuit TEXT NOT NULL DEFAULT '',
    razonSocial TEXT NOT NULL DEFAULT '',
    condicionIVAId INTEGER NOT NULL DEFAULT 5,

    telefono TEXT,
    email TEXT,
    direccion TEXT,

    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_clientes_razon ON clientes(razonSocial);

  CREATE UNIQUE INDEX IF NOT EXISTS ux_clientes_cuit
  ON clientes(cuit)
  WHERE cuit <> '';
`);



// articulos
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

// settings Emisor
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

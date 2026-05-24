const Database = require('better-sqlite3');
const path = require('path');

// Ruta a la base de datos (se crea automáticamente en la primera ejecución)
const dbPath = process.env.DB_PATH || path.join(__dirname, 'expense.db');
const db = new Database(dbPath);

// Optimización para SQLite
db.pragma('journal_mode = WAL');

// Crear tablas si no existen
db.exec(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS movimientos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    tipo TEXT CHECK(tipo IN ('ingreso', 'gasto')) NOT NULL,
    categoria TEXT NOT NULL,
    monto REAL NOT NULL,
    fecha DATE NOT NULL,
    nota TEXT,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
  );
`);

module.exports = db;
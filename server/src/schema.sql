CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TEXT DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS categories (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS materials (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  unit       TEXT NOT NULL DEFAULT 'g',
  unit_price REAL NOT NULL DEFAULT 0,
  remark     TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS dishes (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id     INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  name            TEXT NOT NULL,
  description     TEXT DEFAULT '',
  steps           TEXT DEFAULT '',
  estimated_price REAL,
  image_url       TEXT DEFAULT '',
  created_at      TEXT DEFAULT (datetime('now', 'localtime')),
  updated_at      TEXT DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS dish_materials (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  dish_id     INTEGER NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
  material_id INTEGER NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  quantity    REAL NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_dm_dish ON dish_materials(dish_id);
CREATE INDEX IF NOT EXISTS idx_dish_cat ON dishes(category_id);

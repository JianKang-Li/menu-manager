import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import Database from 'node:sqlite';
import bcrypt from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });

export const db = new Database.DatabaseSync(path.join(DATA_DIR, 'menu.db'));
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

db.exec(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));

// 首次启动：users 表为空时用 ADMIN_PASSWORD 创建管理员
const userCount = db.prepare('SELECT COUNT(*) AS c FROM users').get().c;
if (userCount === 0) {
  const pwd = process.env.ADMIN_PASSWORD;
  if (!pwd) {
    console.error('[init] 首次启动必须设置 ADMIN_PASSWORD 环境变量');
    process.exit(1);
  }
  db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)')
    .run('admin', bcrypt.hashSync(pwd, 10));
  console.log('[init] 已创建管理员 admin');
}

export const stmts = {
  getUser: db.prepare('SELECT * FROM users WHERE username = ?'),
  updatePassword: db.prepare('UPDATE users SET password_hash = ? WHERE id = ?'),

  listCategories: db.prepare(`
    SELECT c.*, COUNT(d.id) AS dish_count
    FROM categories c LEFT JOIN dishes d ON d.category_id = c.id
    GROUP BY c.id ORDER BY c.sort_order, c.id`),
  getCategory: db.prepare('SELECT * FROM categories WHERE id = ?'),
  insertCategory: db.prepare('INSERT INTO categories (name, sort_order) VALUES (?, ?)'),
  updateCategory: db.prepare('UPDATE categories SET name = ?, sort_order = ? WHERE id = ?'),
  deleteCategory: db.prepare('DELETE FROM categories WHERE id = ?'),

  listMaterials: db.prepare('SELECT * FROM materials ORDER BY name'),
  getMaterial: db.prepare('SELECT * FROM materials WHERE id = ?'),
  insertMaterial: db.prepare('INSERT INTO materials (name, unit, unit_price, remark) VALUES (?, ?, ?, ?)'),
  updateMaterial: db.prepare('UPDATE materials SET name = ?, unit = ?, unit_price = ?, remark = ? WHERE id = ?'),
  deleteMaterial: db.prepare('DELETE FROM materials WHERE id = ?'),
  countMaterialUsage: db.prepare('SELECT COUNT(DISTINCT dish_id) AS c FROM dish_materials WHERE material_id = ?'),

  listDishes: db.prepare(`
    SELECT d.id, d.name, d.description, d.estimated_price, d.image_url,
           c.name AS category_name,
           COALESCE(SUM(dm.quantity * m.unit_price), 0) AS computed_cost
    FROM dishes d
    LEFT JOIN categories c ON c.id = d.category_id
    LEFT JOIN dish_materials dm ON dm.dish_id = d.id
    LEFT JOIN materials m ON m.id = dm.material_id
    GROUP BY d.id ORDER BY d.id DESC`),
  getDish: db.prepare('SELECT * FROM dishes WHERE id = ?'),
  insertDish: db.prepare(`INSERT INTO dishes (category_id, name, description, steps, estimated_price, image_url)
    VALUES (?, ?, ?, ?, ?, ?)`),
  updateDish: db.prepare(`UPDATE dishes SET category_id = ?, name = ?, description = ?, steps = ?,
    estimated_price = ?, image_url = ?, updated_at = datetime('now', 'localtime') WHERE id = ?`),
  deleteDish: db.prepare('DELETE FROM dishes WHERE id = ?'),
  listDishMaterials: db.prepare(`
    SELECT dm.material_id, dm.quantity, m.name, m.unit, m.unit_price
    FROM dish_materials dm JOIN materials m ON m.id = dm.material_id
    WHERE dm.dish_id = ?`),
  insertDishMaterial: db.prepare('INSERT INTO dish_materials (dish_id, material_id, quantity) VALUES (?, ?, ?)'),
  deleteDishMaterials: db.prepare('DELETE FROM dish_materials WHERE dish_id = ?'),
};

export const round2 = (x) => Math.round(Number(x) * 100) / 100;

// 简单同步事务（node:sqlite 无 db.transaction，手动包装）
export function withTransaction(fn) {
  db.exec('BEGIN');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

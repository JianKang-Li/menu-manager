import fs from 'node:fs';
import path from 'node:path';
import { Router } from 'express';
import { db, withTransaction } from '../db.js';
import { UPLOAD_DIR } from './uploads.js';

const router = Router();

// 导出备份：菜品/材料/分类/关联 + 已上传图片(base64) 打包为单个 JSON
router.get('/', (req, res) => {
  const data = {
    version: 1,
    exported_at: new Date().toISOString(),
    categories: db.prepare('SELECT * FROM categories').all(),
    materials: db.prepare('SELECT * FROM materials').all(),
    dishes: db.prepare('SELECT * FROM dishes').all(),
    dish_materials: db.prepare('SELECT * FROM dish_materials').all(),
  };
  // 内嵌本地上传的图片（/uploads/ 开头），外链图片跳过
  const images = {};
  for (const d of data.dishes) {
    if (d.image_url && d.image_url.startsWith('/uploads/')) {
      const file = path.join(UPLOAD_DIR, path.basename(d.image_url));
      if (fs.existsSync(file)) {
        images[d.image_url] = `data:image/${path.extname(file).slice(1) || 'jpeg'};base64,` +
          fs.readFileSync(file).toString('base64');
      }
    }
  }
  data.images = images;
  const stamp = new Date().toISOString().slice(0, 10);
  res.setHeader('Content-Disposition', `attachment; filename="menu-backup-${stamp}.json"`);
  res.json(data);
});

// 导入恢复：整体替换当前数据（含还原图片文件）
router.post('/', (req, res) => {
  const data = req.body;
  for (const key of ['categories', 'materials', 'dishes', 'dish_materials']) {
    if (!Array.isArray(data?.[key])) return res.status(400).json({ error: '备份文件格式不正确' });
  }
  withTransaction(() => {
    db.exec('DELETE FROM dish_materials; DELETE FROM dishes; DELETE FROM materials; DELETE FROM categories;');
    db.exec("DELETE FROM sqlite_sequence WHERE name IN ('categories','materials','dishes','dish_materials')");
    for (const c of data.categories) {
      db.prepare('INSERT INTO categories (id, name, sort_order) VALUES (?, ?, ?)').run(c.id, c.name, c.sort_order);
    }
    for (const m of data.materials) {
      db.prepare('INSERT INTO materials (id, name, unit, unit_price, remark) VALUES (?, ?, ?, ?, ?)')
        .run(m.id, m.name, m.unit, m.unit_price, m.remark);
    }
    for (const d of data.dishes) {
      db.prepare(`INSERT INTO dishes (id, category_id, name, description, steps, estimated_price, image_url, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(d.id, d.category_id, d.name, d.description, d.steps, d.estimated_price, d.image_url, d.created_at, d.updated_at);
    }
    for (const dm of data.dish_materials) {
      db.prepare('INSERT INTO dish_materials (id, dish_id, material_id, quantity) VALUES (?, ?, ?, ?)')
        .run(dm.id, dm.dish_id, dm.material_id, dm.quantity);
    }
  });
  // 还原图片文件
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  for (const [url, dataUri] of Object.entries(data.images || {})) {
    if (!url.startsWith('/uploads/')) continue;
    const match = /^data:image\/\w+;base64,(.+)$/.exec(dataUri);
    if (!match) continue;
    const name = path.basename(url);
    if (!/^[\w-]+\.(jpg|jpeg|png|gif|webp)$/i.test(name)) continue;
    fs.writeFileSync(path.join(UPLOAD_DIR, name), Buffer.from(match[1], 'base64'));
  }
  res.json({ ok: true, dishes: data.dishes.length, materials: data.materials.length });
});

export default router;

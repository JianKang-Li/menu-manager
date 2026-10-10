import { Router } from 'express';
import { stmts } from '../db.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json(stmts.listCategories.all());
});

router.post('/', (req, res) => {
  const { name, sort_order = 0 } = req.body || {};
  if (!name?.trim()) return res.status(400).json({ error: '分类名不能为空' });
  try {
    const info = stmts.insertCategory.run(name.trim(), Number(sort_order) || 0);
    res.json(stmts.getCategory.get(info.lastInsertRowid));
  } catch {
    res.status(400).json({ error: '分类名已存在' });
  }
});

router.put('/:id', (req, res) => {
  const existing = stmts.getCategory.get(req.params.id);
  if (!existing) return res.status(404).json({ error: '分类不存在' });
  const { name, sort_order = existing.sort_order } = req.body || {};
  if (!name?.trim()) return res.status(400).json({ error: '分类名不能为空' });
  try {
    stmts.updateCategory.run(name.trim(), Number(sort_order) || 0, existing.id);
    res.json(stmts.getCategory.get(existing.id));
  } catch {
    res.status(400).json({ error: '分类名已存在' });
  }
});

router.delete('/:id', (req, res) => {
  stmts.deleteCategory.run(req.params.id);
  res.json({ ok: true });
});

export default router;

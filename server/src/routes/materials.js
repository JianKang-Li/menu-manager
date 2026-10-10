import { Router } from 'express';
import { stmts, round2 } from '../db.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json(stmts.listMaterials.all());
});

router.post('/', (req, res) => {
  const { name, unit = 'g', unit_price = 0, remark = '' } = req.body || {};
  if (!name?.trim()) return res.status(400).json({ error: '材料名不能为空' });
  const info = stmts.insertMaterial.run(name.trim(), unit, round2(unit_price), remark);
  res.json(stmts.getMaterial.get(info.lastInsertRowid));
});

router.put('/:id', (req, res) => {
  const existing = stmts.getMaterial.get(req.params.id);
  if (!existing) return res.status(404).json({ error: '材料不存在' });
  const { name = existing.name, unit = existing.unit,
          unit_price = existing.unit_price, remark = existing.remark } = req.body || {};
  if (!name?.trim()) return res.status(400).json({ error: '材料名不能为空' });
  stmts.updateMaterial.run(name.trim(), unit, round2(unit_price), remark, existing.id);
  res.json(stmts.getMaterial.get(existing.id));
});

router.delete('/:id', (req, res) => {
  const usage = stmts.countMaterialUsage.get(req.params.id).c;
  if (usage > 0) {
    return res.status(400).json({ error: `该材料正被 ${usage} 个菜品使用，请先移除关联` });
  }
  stmts.deleteMaterial.run(req.params.id);
  res.json({ ok: true });
});

export default router;

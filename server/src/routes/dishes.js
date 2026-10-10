import { Router } from 'express';
import { db, stmts, round2, withTransaction } from '../db.js';

const router = Router();

const roundMaterials = (rows) => rows.map((m) => ({
  ...m,
  quantity: round2(m.quantity),
  unit_price: round2(m.unit_price),
  subtotal: round2(m.quantity * m.unit_price),
}));

function dishDetail(id) {
  const dish = stmts.getDish.get(id);
  if (!dish) return null;
  const materials = roundMaterials(stmts.listDishMaterials.all(id));
  return {
    ...dish,
    estimated_price: dish.estimated_price == null ? null : round2(dish.estimated_price),
    materials,
    computed_cost: round2(materials.reduce((s, m) => s + m.subtotal, 0)),
  };
}

// 保存菜品（含材料关联）的事务
const saveDish = (payload, id = null) => withTransaction(() => {
  const category_id = payload.category_id || null;
  const estimated = payload.estimated_price === '' || payload.estimated_price == null
    ? null : round2(payload.estimated_price);
  let dishId = id;
  if (id == null) {
    dishId = stmts.insertDish.run(
      category_id, payload.name.trim(), payload.description || '',
      payload.steps || '', estimated, payload.image_url || '').lastInsertRowid;
  } else {
    stmts.updateDish.run(
      category_id, payload.name.trim(), payload.description || '',
      payload.steps || '', estimated, payload.image_url || '', id);
  }
  stmts.deleteDishMaterials.run(dishId);
  for (const m of payload.materials || []) {
    if (m.material_id && Number(m.quantity) > 0) {
      stmts.insertDishMaterial.run(dishId, m.material_id, Number(m.quantity));
    }
  }
  return dishId;
});

function validatePayload(payload) {
  if (!payload?.name?.trim()) return '菜品名不能为空';
  if (payload.materials?.some((m) => !m.material_id)) return '材料行中有未选择的材料';
  return null;
}

router.get('/', (req, res) => {
  let rows = stmts.listDishes.all().map((d) => ({
    ...d,
    computed_cost: round2(d.computed_cost),
    estimated_price: d.estimated_price == null ? null : round2(d.estimated_price),
  }));
  if (req.query.category_id) {
    rows = rows.filter((d) => d.category_id === Number(req.query.category_id));
  }
  if (req.query.search) {
    const q = String(req.query.search).toLowerCase();
    rows = rows.filter((d) => d.name.toLowerCase().includes(q));
  }
  res.json(rows);
});

router.get('/:id', (req, res) => {
  const dish = dishDetail(req.params.id);
  if (!dish) return res.status(404).json({ error: '菜品不存在' });
  res.json(dish);
});

router.post('/', (req, res) => {
  const err = validatePayload(req.body);
  if (err) return res.status(400).json({ error: err });
  const id = saveDish(req.body);
  res.json(dishDetail(id));
});

router.put('/:id', (req, res) => {
  if (!stmts.getDish.get(req.params.id)) return res.status(404).json({ error: '菜品不存在' });
  const err = validatePayload(req.body);
  if (err) return res.status(400).json({ error: err });
  saveDish(req.body, Number(req.params.id));
  res.json(dishDetail(req.params.id));
});

router.delete('/:id', (req, res) => {
  stmts.deleteDish.run(req.params.id);
  res.json({ ok: true });
});

export default router;

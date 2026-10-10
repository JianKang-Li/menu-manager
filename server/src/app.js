import express from 'express';
import authRouter from './routes/auth.js';
import categoriesRouter from './routes/categories.js';
import materialsRouter from './routes/materials.js';
import dishesRouter from './routes/dishes.js';
import uploadsRouter, { DATA_DIR } from './routes/uploads.js';
import backupRouter from './routes/backup.js';
import { authRequired } from './middleware/auth.js';

export function createApp() {
  const app = express();
  app.use(express.json());

  app.use('/api/auth', authRouter);
  // 除登录外，所有 /api 路由需要认证（auth 路由已在其上方处理，不会走到这里）
  app.use('/api', authRequired);
  app.use('/api/categories', categoriesRouter);
  app.use('/api/materials', materialsRouter);
  app.use('/api/dishes', dishesRouter);
  app.use('/api/upload', uploadsRouter);
  app.use('/api/backup', backupRouter);

  app.use('/api', (_req, res) => res.status(404).json({ error: '接口不存在' }));

  // 统一错误处理
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    console.error('[error]', err);
    const isMulter = err?.name === 'MulterError' || /仅支持图片/.test(err?.message || '');
    res.status(isMulter ? 400 : 500).json({ error: err.message || '服务器内部错误' });
  });

  return app;
}

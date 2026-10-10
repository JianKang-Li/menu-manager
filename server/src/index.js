import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { createApp } from './app.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const PORT = process.env.PORT || 3000;

const app = createApp();

// 生产环境：托管 Vue 构建产物 + 上传图片 + SPA fallback
if (fs.existsSync(PUBLIC_DIR)) {
  const UPLOAD_DIR = path.join(process.env.DATA_DIR || path.join(ROOT, 'data'), 'uploads');
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  app.use('/uploads', express.static(UPLOAD_DIR));
  app.use(express.static(PUBLIC_DIR));
  app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(path.join(PUBLIC_DIR, 'index.html')));
}

app.listen(PORT, () => {
  console.log(`[server] menu-manager 已启动: http://localhost:${PORT}`);
});

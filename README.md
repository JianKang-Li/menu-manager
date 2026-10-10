# 我的菜单 (menu-manager)

在线个人菜单/菜谱管理系统：菜品展示、材料与制作流程、成本自动计算、图片上传、数据备份。

## 技术栈

- 前端：Vue 3 + Vite + Tailwind CSS + daisyUI（餐馆暖色主题，手机适配）
- 后端：Express 5 + Node 内置 `node:sqlite`（零原生编译依赖）
- 认证：bcryptjs + JWT，单管理员密码
- 部署：Docker 多阶段构建，SQLite 单文件持久化

## 功能

- 菜单展示：分类筛选、搜索、菜品卡片，点击查看材料清单 + 单价小计 + 制作流程
- 成本计算：录入材料单价与用量自动算成本；也可手填预估价（优先显示）
- 菜品/材料/分类管理：增删改查
- 图片上传：菜品图片存 `data/uploads`，随数据卷持久化
- 数据备份：导出 JSON（图片以 base64 内嵌）/ 导入恢复
- 修改密码

## Docker 部署（推荐）

```bash
# 1. 编辑 .env，设置密码和密钥
vim .env   # ADMIN_PASSWORD / JWT_SECRET

# 2. 启动（首次或代码改动后加 --build）
docker-compose up -d --build
```

访问 http://localhost:3300

- `ADMIN_PASSWORD`：首次启动创建管理员 admin 的密码（之后修改它不影响已有密码，改密请在应用内操作）
- `JWT_SECRET`：登录令牌签名密钥，请设为随机长字符串（`openssl rand -hex 32`）
- 环境变量统一在 `.env` 文件中配置（compose 通过 `env_file` 读取，不使用 `${}` 插值，兼容旧版 docker-compose）
- 数据持久化在 `./data` 目录（`menu.db` + `uploads/`）

## 本地开发

```bash
# 后端（端口 3000）
cd server && npm install
ADMIN_PASSWORD=dev123 npm run dev

# 前端（端口 5173，已配置 /api 代理）
cd client && npm install --legacy-peer-deps && npm run dev
```

## 数据备份

- 应用内：管理 → 设置 → 下载备份 / 导入恢复
- 直接拷贝：备份整个 `data/` 目录即可（停止容器后拷贝最安全）

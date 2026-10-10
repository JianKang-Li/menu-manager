# ---- 阶段 1：构建前端 ----
FROM node:24-alpine AS client-build
WORKDIR /build
COPY client/package*.json ./
RUN npm install --legacy-peer-deps
COPY client/ ./
RUN npm run build

# ---- 阶段 2：运行时 ----
# node:sqlite 为 Node 22.5+ 内置模块，无需原生编译
FROM node:24-bookworm-slim
WORKDIR /app
COPY server/package*.json ./
RUN npm install --omit=dev
COPY server/ ./server
COPY --from=client-build /build/dist ./server/public
ENV NODE_ENV=production DATA_DIR=/app/data PORT=3000
VOLUME /app/data
EXPOSE 3000
CMD ["node", "server/src/index.js"]

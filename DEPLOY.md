# 部署指南

## 方案一：Vercel + Neon 数据库（推荐）

### 1. 创建 Neon 数据库（免费）

1. 访问 https://neon.tech
2. 用 GitHub 账号登录
3. 创建新项目
4. 复制连接字符串（格式：`postgresql://user:pass@host/db?sslmode=require`）

### 2. 部署到 Vercel

1. 访问 https://vercel.com/new
2. 导入 GitHub 仓库 `prompt-manager`
3. 添加环境变量：
   - `POSTGRES_PRISMA_URL` = Neon 连接字符串 + `&pgbouncer=true&connect_timeout=15`
   - `POSTGRES_URL_NON_POOLING` = Neon 连接字符串（原始）
4. 点击 Deploy

### 3. 初始化数据库

部署完成后，在本地运行：
```bash
npx prisma migrate deploy
# 或直接在 Vercel 控制台运行
```

---

## 方案二：本地运行（无需部署）

### 1. 安装依赖
```bash
npm install
```

### 2. 配置本地数据库

安装 PostgreSQL 或使用 Docker：
```bash
docker run -d --name postgres \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=promptdb \
  -p 5432:5432 postgres:15
```

### 3. 配置环境变量

创建 `.env` 文件：
```env
POSTGRES_PRISMA_URL="postgresql://admin:password@localhost:5432/promptdb"
POSTGRES_URL_NON_POOLING="postgresql://admin:password@localhost:5432/promptdb"
```

### 4. 初始化数据库
```bash
npx prisma migrate dev --name init
npx prisma db seed  # 如果有种子数据
```

### 5. 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:3000

---

## 方案三：Vercel Postgres（原生集成）

1. 在 Vercel Dashboard 进入项目
2. 点击 **Storage** → **Create Database** → **Postgres**
3. 选择区域，创建数据库
4. 环境变量会自动添加到项目
5. 重新部署项目

---

## 快速启动脚本

```bash
# 一键本地启动（需 Docker）
npm run setup:local

# 一键部署（需 Vercel CLI）
npm run deploy
```

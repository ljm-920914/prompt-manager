# Prompt Manager - 提示词管理工具

一个美观简洁的提示词管理网站，支持从链接、视频、图片、文本中提取和整理 AI 提示词。

## 功能特性

- **多种输入方式**：支持文本、链接、图片、视频
- **智能提取**：自动识别并提取提示词内容
- **分类管理**：自动分类 + 自定义分类
- **标签系统**：灵活的标签管理
- **收藏功能**：标记常用提示词
- **搜索过滤**：按关键词、分类、标签筛选
- **一键复制**：快速复制提示词内容

## 技术栈

- **框架**：Next.js 14 (App Router)
- **语言**：TypeScript
- **样式**：Tailwind CSS
- **数据库**：PostgreSQL + Prisma
- **状态管理**：Zustand

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置数据库

复制环境变量文件并配置数据库：

```bash
cp .env.example .env
```

编辑 `.env` 文件，设置你的 PostgreSQL 连接字符串：

```
DATABASE_URL="postgresql://user:password@localhost:5432/prompt_manager"
```

### 3. 初始化数据库

```bash
npx prisma migrate dev --name init
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 部署到 Vercel

### 1. 创建 Vercel 项目

```bash
npm i -g vercel
vercel
```

### 2. 配置数据库

在 Vercel Dashboard 中创建 Postgres 数据库，或者使用其他 PostgreSQL 服务（如 Supabase、Railway）。

### 3. 设置环境变量

在 Vercel 项目设置中添加 `DATABASE_URL` 环境变量。

### 4. 部署

```bash
vercel --prod
```

## 项目结构

```
prompt-manager/
├── prisma/
│   └── schema.prisma      # 数据库模型
├── src/
│   ├── app/
│   │   ├── api/           # API 路由
│   │   ├── page.tsx       # 主页面
│   │   └── layout.tsx     # 根布局
│   ├── components/        # React 组件
│   ├── lib/
│   │   └── prisma.ts      # Prisma 客户端
│   └── store/
│       └── promptStore.ts # 状态管理
└── package.json
```

## 后续优化建议

1. **接入 AI API**：使用 OpenAI/Claude API 实现更智能的提示词提取和分类
2. **链接抓取**：集成 puppeteer/playwright 自动抓取网页内容
3. **图片 OCR**：接入 OCR 服务提取图片中的提示词
4. **视频处理**：集成视频转文字服务
5. **用户系统**：添加登录功能，支持个人/团队空间
6. **导入导出**：支持 JSON/CSV 格式的批量导入导出

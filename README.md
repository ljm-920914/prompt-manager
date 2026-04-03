# Prompt Manager - 提示词管理工具

一个简洁美观的提示词管理网站，支持链接、视频、图片、文字等多种输入方式，自动提取和分类提示词内容。

## 功能特性

- **多种输入方式**：支持链接、视频、图片、文字
- **智能提取**：自动从链接/内容中提取提示词
- **分类管理**：自定义分类和标签
- **快速搜索**：实时搜索和筛选
- **分享功能**：一键分享给同事
- **响应式设计**：适配桌面和移动端

## 技术栈

- Next.js 16 + TypeScript
- Tailwind CSS
- Prisma + PostgreSQL
- Zustand 状态管理

## 快速开始

### 方式一：本地开发（推荐）

需要 Docker 环境：

```bash
# 一键设置（自动启动数据库、安装依赖、初始化）
npm run setup:local

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000

### 方式二：手动配置

1. **安装依赖**
```bash
npm install
```

2. **配置数据库**

创建 `.env` 文件：
```env
POSTGRES_PRISMA_URL="postgresql://admin:password@localhost:5432/promptdb"
POSTGRES_URL_NON_POOLING="postgresql://admin:password@localhost:5432/promptdb"
```

3. **启动 PostgreSQL**
```bash
docker run -d --name promptdb \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=promptdb \
  -p 5432:5432 postgres:15
```

4. **初始化数据库**
```bash
npx prisma migrate dev --name init
```

5. **启动服务**
```bash
npm run dev
```

### 方式三：部署到 Vercel

1. Fork 本仓库到 GitHub
2. 访问 [Vercel](https://vercel.com/new) 导入项目
3. 添加 PostgreSQL 数据库（Vercel Postgres 或 Neon）
4. 环境变量会自动配置
5. 点击 Deploy

详细部署指南见 [DEPLOY.md](./DEPLOY.md)

## 使用说明

### 添加提示词

1. 点击右上角「添加提示词」
2. 选择输入类型（链接/视频/图片/文字）
3. 粘贴内容，系统自动提取提示词
4. 选择分类和标签
5. 保存

### 管理提示词

- **搜索**：顶部搜索框实时过滤
- **筛选**：按分类、标签筛选
- **编辑**：点击卡片右上角编辑
- **删除**：点击卡片右上角删除
- **复制**：点击复制按钮复制提示词

### 分享

- 直接分享网站链接给同事
- 同事可以查看、搜索所有提示词
- 支持协作编辑（后续版本）

## 项目结构

```
prompt-manager/
├── src/
│   ├── app/              # Next.js 应用
│   │   ├── api/          # API 路由
│   │   ├── page.tsx      # 主页面
│   │   └── layout.tsx    # 根布局
│   ├── components/       # React 组件
│   │   ├── AddPromptModal.tsx
│   │   ├── PromptCard.tsx
│   │   └── EditPromptModal.tsx
│   ├── store/            # Zustand 状态管理
│   └── lib/              # 工具函数
├── prisma/
│   └── schema.prisma     # 数据库模型
├── scripts/
│   └── setup-local.js    # 本地设置脚本
└── DEPLOY.md             # 部署指南
```

## 开发命令

```bash
npm run dev          # 开发服务器
npm run build        # 生产构建
npm run setup:local  # 本地环境一键设置
npm run db:migrate   # 数据库迁移
npm run db:studio    # 打开 Prisma Studio
```

## License

MIT

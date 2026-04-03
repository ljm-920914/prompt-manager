#!/usr/bin/env node

/**
 * 本地开发环境一键设置脚本
 * 自动启动 PostgreSQL Docker 容器并初始化数据库
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const DB_NAME = 'promptdb';
const DB_USER = 'admin';
const DB_PASS = 'password';
const DB_PORT = 5432;

function exec(command, options = {}) {
  console.log(`> ${command}`);
  return execSync(command, { stdio: 'inherit', ...options });
}

function checkDocker() {
  try {
    execSync('docker --version', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function createEnvFile() {
  const envPath = path.join(__dirname, '..', '.env');
  const envContent = `# 本地开发环境配置
POSTGRES_PRISMA_URL="postgresql://${DB_USER}:${DB_PASS}@localhost:${DB_PORT}/${DB_NAME}"
POSTGRES_URL_NON_POOLING="postgresql://${DB_USER}:${DB_PASS}@localhost:${DB_PORT}/${DB_NAME}"
`;
  
  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ 已创建 .env 文件');
  } else {
    console.log('⚠️ .env 文件已存在，跳过创建');
  }
}

async function main() {
  console.log('🚀 开始设置本地开发环境...\n');

  // 检查 Docker
  if (!checkDocker()) {
    console.error('❌ 请先安装 Docker: https://docs.docker.com/get-docker/');
    process.exit(1);
  }

  // 启动 PostgreSQL 容器
  try {
    execSync(`docker ps -q -f name=${DB_NAME}`, { stdio: 'pipe' });
    console.log('✅ PostgreSQL 容器已在运行');
  } catch {
    console.log('📦 启动 PostgreSQL Docker 容器...');
    try {
      exec(`docker run -d --name ${DB_NAME} \
        -e POSTGRES_USER=${DB_USER} \
        -e POSTGRES_PASSWORD=${DB_PASS} \
        -e POSTGRES_DB=${DB_NAME} \
        -p ${DB_PORT}:5432 postgres:15-alpine`);
      console.log('⏳ 等待数据库启动...');
      await new Promise(r => setTimeout(r, 3000));
    } catch {
      console.log('⚠️ 容器可能已存在，尝试启动...');
      exec(`docker start ${DB_NAME}`);
    }
  }

  // 创建环境变量文件
  createEnvFile();

  // 安装依赖
  console.log('\n📥 安装依赖...');
  exec('npm install');

  // 生成 Prisma 客户端
  console.log('\n🔧 生成 Prisma 客户端...');
  exec('npx prisma generate');

  // 运行数据库迁移
  console.log('\n🗄️  初始化数据库...');
  exec('npx prisma migrate dev --name init');

  console.log('\n✅ 设置完成！');
  console.log('\n启动开发服务器:');
  console.log('  npm run dev');
  console.log('\n访问: http://localhost:3000');
}

main().catch(err => {
  console.error('❌ 设置失败:', err.message);
  process.exit(1);
});

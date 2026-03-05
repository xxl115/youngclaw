# SwarmClaw

AI Agent Orchestration Dashboard

## 项目简介

SwarmClaw 是一个 AI Agent 编排和管理仪表板，支持多个 AI 提供商，具有强大的任务管理、记忆系统、连接器集成等功能。

## 技术栈

- **框架**: Next.js 16.1.6 (React 19.2.3)
- **语言**: TypeScript
- **数据库**: SQLite (better-sqlite3)
- **AI 提供商**: Claude CLI, OpenClaw, OpenAI
- **连接器**: Telegram, Discord, Slack, WhatsApp (Baileys)

## 快速开始

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```

访问: `http://localhost:3456`

### 生产构建
```bash
npm run build
```

### 生产运行
```bash
PORT=3456 npm start
```

或使用 standalone 模式：
```bash
node .next/standalone/server.js
```

## PWA 支持

SwarmClaw 支持 PWA（Progressive Web App），可以安装为移动应用。

### 安装方法（Android）
1. 在 Chrome 浏览器访问 `http://192.168.0.108:3456`
2. 点击菜单（三个点）
3. 选择"添加到主屏幕"
4. 确认安装

### 生产环境 PWA
- HTTPS: `https://claw.xxl185.dpdns.org/`
- Manifest: `/manifest.json`
- Service Worker: `/sw.js`

## 主要功能

- 🤖 **Agent 管理** - 创建和管理多个 AI Agents
- 💬 **多平台连接** - Telegram, Discord, Slack, WhatsApp
- 📋 **任务管理** - 创建、追踪和完成任务
- 🧠 **记忆系统** - 持久化对话记忆
- 🔌 **连接器** - 集成外部服务和 API
- 📊 **使用统计** - 追踪 API 使用和成本
- 🗂️ **知识库** - 管理文档和知识

## 文档

- [项目文档](./docs/README.md) - 详细的项目文档和日志说明
- [PWA 配置日志](./docs/logs/PWA-WORK-LOG.md) - PWA 配置工作记录
- [应用日志](./docs/logs/app-2026-03-03.log) - 当前应用运行日志

## 目录结构

```
swarmclaw/
├── src/                    # 源代码
│   ├── app/               # Next.js App Router
│   ├── components/        # React 组件
│   ├── lib/              # 工具库
│   └── stores/           # 状态管理
├── data/                  # 数据文件
│   ├── swarmclaw.db      # 主数据库
│   ├── memory.db         # 记忆数据库
│   └── app.log           # 应用日志
├── docs/                  # 项目文档
│   └── logs/            # 日志和报告
├── public/                # 静态资源
│   ├── manifest.json     # PWA manifest
│   └── sw.js            # Service worker
└── README.md             # 本文件
```

## 常见问题

### Claude CLI 未认证
错误: `Claude CLI is not authenticated`

解决:
```bash
claude auth login
```

### PWA 无法安装
确保：
- 使用 HTTPS（生产环境）或 localhost（开发环境）
- 浏览器支持 PWA（Chrome, Edge 等）
- Manifest 文件可访问

### 数据库文件不要删除
⚠️ 重要: 不要删除 `data/` 目录下的 `.db` 文件，包含核心数据。

## 开发脚本

```bash
npm run dev              # 开发模式（Turbopack）
npm run dev:webpack      # 开发模式（Webpack）
npm run build            # 生产构建（Webpack）
npm run start            # 启动生产服务器
npm run lint             # 代码检查
npm run lint:fix         # 自动修复 lint 问题
```

## 许可证

MIT

## 贡献

欢迎提交 Issue 和 Pull Request！

# Telegram Bot 接入指南

本文档介绍 Telegram Bot 在 SwarmClaw 中的接入流程。

---

## 1. 快速开始

### 1.1 创建 Bot

1. 打开 Telegram，搜索 **@BotFather**
2. 发送 `/newbot`
3. 设置名称和用户名（以 `bot` 结尾）
4. 获取 Bot Token

### 1.2 配置 Bot

| 命令 | 说明 |
|------|------|
| `/setprivacy` | 设置为 Disable（让机器人能看到所有消息） |
| `/setjoingroups` | 设置是否允许加入群组 |

### 1.3 在 SwarmClaw 中配置

1. 访问 **Connectors** 页面
2. 添加新的 Telegram Connector
3. 填写配置：
   - **Bot Token**: 从 BotFather 获取的 token
   - **Proxy URL**: `http://127.0.0.1:7890`（国内服务器需要）
   - **Agent**: 选择一个 Agent
4. 保存并启动

---

## 2. 消息流程

```
Telegram 用户发送消息
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│  grammy Bot (Polling)                                  │
│  telegram.ts: bot.on('message')                        │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│  构建 InboundMessage                                    │
│  telegram.ts: 接收消息并提取文本、媒体                  │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│  dispatchInboundConnectorMessage()                      │
│  manager.ts: 消息路由                                    │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│  routeMessage()                                         │
│  manager.ts: 查找 Agent 并创建 Session                  │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│  Agent 处理                                             │
│  调用 LLM 生成回复                                     │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│  ctx.reply()                                           │
│  telegram.ts: 发送回复给用户                            │
└─────────────────────────────────────────────────────────┘
```

---

## 3. 配置项说明

| 配置项 | 必填 | 说明 |
|--------|------|------|
| `botToken` | 是 | Telegram Bot Token |
| `proxy` | 否 | HTTP 代理地址（如 `http://127.0.0.1:7890`） |
| `chatIds` | 否 | 允许接收消息的聊天 ID（逗号分隔） |
| `dmPolicy` | 否 | 私信策略：`pairing` / `allowlist` / `open` |
| `groupPolicy` | 否 | 群组策略：`open` / `allowlist` |

---

## 4. 代理配置（国内服务器）

国内服务器无法直接访问 Telegram API，需要通过代理。

### 4.1 安装依赖

```bash
npm install https-proxy-agent
```

### 4.2 代码实现

```typescript
// src/lib/server/connectors/telegram.ts
import { HttpsProxyAgent } from 'https-proxy-agent'

const proxyUrl = connector.config.proxy?.trim()
const httpsAgent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined

const bot = new Bot(botToken, httpsAgent ? {
  client: {
    baseFetchConfig: {
      agent: httpsAgent,
    },
  },
} : undefined)
```

### 4.3 注意事项

- 必须使用 `baseFetchConfig.agent`，不能使用自定义 fetch
- 确保只有一个 Bot 实例运行
- 代理格式：`http://host:port`（如 `http://127.0.0.1:7890`）

---

## 5. 常见问题

### Q1: Bot 启动失败，提示 409 Conflict

**原因**：有多个实例使用同一个 bot token

**解决**：
1. 确保只运行一个 Telegram 连接器
2. 检查并删除重复的连接器

---

### Q2: 代理不生效，提示 Network request failed

**原因**：代理配置方式不正确

**解决**：
1. 确保已安装 `https-proxy-agent`
2. 检查 `baseFetchConfig.agent` 配置是否正确
3. 验证代理服务器是否正常运行

---

### Q3: Bot Token 不生效

**原因**：系统优先从 credential 读取 token

**解决**：
1. 移除 `credentialId` 配置
2. 直接在 `config.botToken` 中填写 token

---

### Q4: 消息收不到回复

**排查步骤**：
1. 检查日志是否有 `[telegram] Message from` 消息
2. 检查 Connector 状态是否为 running
3. 检查 Agent 是否正确配置
4. 检查 Agent 是否有 tools 权限

---

### Q5: Polling 超时

**排查**：
1. 检查 Bot Token 是否正确
2. 检查网络/代理是否正常
3. 检查防火墙是否阻止

---

## 6. 调试日志

### 关键日志

启动时应该看到：
```
[telegram] Using proxy: http://127.0.0.1:7890
[telegram] Bot API OK: @username (id=123456789)
[telegram] Bot started as @username
```

收到消息时：
```
[telegram] Message from 用户名 (chat=123456789): 消息内容
[connector] Routing message to agent "Agent名称"
```

### 查看日志

```bash
# 实时查看 telegram 日志
tail -f data/app.log | grep -i telegram
```
[telegram] ===== USING PROXY: http://127.0.0.1:7890 =====
[telegram] ===== BOT API OK: @username (id=123456789) =====
[telegram] ===== BOT STARTED: @username =====
```

收到消息时：
```
[telegram] Message from 用户名 (chat=123456789): 消息内容
[connector] Routing message to agent "Agent名称"
```

### 查看日志

```bash
# 实时查看 telegram 日志
tail -f data/app.log | grep -i telegram
```

---

## 7. 核心文件

| 文件 | 职责 |
|------|------|
| `src/lib/server/connectors/telegram.ts` | Telegram 连接器实现 |
| `src/lib/server/connectors/manager.ts` | 连接器生命周期管理 |
| `src/lib/server/chat-execution.ts` | 聊天执行逻辑 |

---

*本文档适用于 SwarmClaw 平台 Telegram Connector 配置。*

# SwarmClaw - AI Agent Development Guide

This guide helps AI agents work effectively with the SwarmClaw codebase.

## Quick Start

```bash
# Clone and install
git clone https://github.com/swarmclawai/swarmclaw.git
cd swarmclaw
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Run tests
npm run test:cli
npm run test:openclaw
```

---

## Build / Lint / Test Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server (port 3456) |
| `npm run build` | Build production bundle with webpack |
| `npm run build:ci` | Build without ESLint checks |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues automatically |
| `npm run test:cli` | Run CLI tests |
| `npm run test:openclaw` | Run OpenClaw connector tests |

### Running a Single Test

```bash
# Run specific test file
tsx --test src/lib/server/connectors/openclaw.test.ts

# Run with grep pattern
tsx --test src/lib/server/connectors/openclaw.test.ts --grep "connector"
```

---

## Code Style Guidelines

### TypeScript Configuration

- **Strict mode enabled** in `tsconfig.json`
- **Target**: ES2017, ESNext
- **Module**: esnext, moduleResolution: bundler
- **No `any`** unless absolutely necessary
- **No `any`** in function parameters (use specific types)

### Import Organization

```typescript
// 1. External dependencies (no @ alias)
import { Bot } from 'grammy'
import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// 2. Internal modules (use @/ alias)
import { loadConnectors } from '@/lib/server/storage'
import { streamAgentChat } from '@/lib/server/stream-agent-chat'
import type { Connector } from '@/types'
import { useAppStore } from '@/stores/use-app-store'

// 3. React
import { useState, useEffect, useCallback, useRef } from 'react'
import { useWs } from '@/hooks/use-ws'
```

### Naming Conventions

| Context | Convention | Examples |
|----------|------------|----------|
| Files | kebab-case | `telegram.ts`, `openclaw.test.ts`, `chat-area.tsx` |
| Components | PascalCase | `ChatInput`, `MessageList`, `ConnectorSheet` |
| Functions | camelCase | `loadConnectors()`, `sendMessage()`, `handleKeyDown()` |
| Constants | UPPER_SNAKE_CASE | `MAX_ATTEMPTS`, `DEFAULT_TIMEOUT`, `COLLECTIONS` |
| Interfaces | PascalCase | `Connector`, `Session`, `Message`, `PlatformConnector` |
| Types | PascalCase | `ProviderType`, `SessionType`, `MessageSource` |
| React Hooks | `use` prefix | `useAppStore()`, `useWs()`, `useMediaQuery()` |
| Event Handlers | `handle` prefix | `handleSend()`, `handleKeyDown()`, `handlePaste()` |
| Private functions | `_` prefix (optional) | `_downloadMedia()`, `_uploadFile()` |

### Formatting & Style

- **Use shadcn/ui components** - don't reinvent UI elements
- **Tailwind CSS** - prefer utility classes over inline styles
- **Avoid inline styles** - use CSS variables (`--color-text`, `--background`, etc.)
- **Dark/Light theme support** - use `isDark` from `useAppStore()`, CSS variables defined in `globals.css`
- **Font**: `Segoe UI` for most text, `Cascadia Code` for monospace

### Error Handling

```typescript
// API Routes - return NextResponse with error
if (!connector) {
  return notFound()
}

// Async operations - wrap in try/catch
try {
  const result = await riskyOperation()
  return NextResponse.json(result)
} catch (err: unknown) {
  console.error('[feature] Operation failed:', err)
  const message = err instanceof Error ? err.message : String(err)
  return NextResponse.json(
    { error: message },
    { status: 500 }
  )
}

// Logging
console.log('[feature] Action:', action)
console.warn('[feature] Warning:', warning)
console.error('[feature] Error:', error)
```

---

## Architecture Overview

### Project Structure

```
swarmclaw/
├── src/
│   ├── app/                    # Next.js App Router (API routes, pages)
│   ├── components/             # React components (chat, connectors, etc.)
│   ├── lib/                   # Internal libraries
│   │   ├── server/            # Server-side code (API, connectors, storage)
│   │   ├── providers/         # LLM provider implementations
│   │   └── shared/           # Shared utilities
│   ├── stores/                # Zustand state management
│   ├── hooks/                 # React hooks
│   └── types/                 # TypeScript type definitions
├── tests/                    # Node.js tests
└── public/                    # Static assets
```

### Key Modules

| Module | Purpose |
|--------|---------|
| `storage.ts` | SQLite persistence (connectors, sessions, agents, etc.) |
| `connector/manager.ts` | Connector lifecycle and routing |
| `stream-agent-chat.ts` | LLM streaming orchestration |
| `ws-hub.ts` | WebSocket server for real-time updates |
| `session-run-manager.ts` | Chat session execution |
| `daemon-state.ts` | Background task scheduler |

---

## Testing Patterns

### Using Node.js Built-in Test Framework

```typescript
import assert from 'node:assert/strict'
import { test } from 'node:test'

test('example test', async () => {
  const result = await someFunction()
  assert.equal(result, 'expected')
  assert.ok(result.success)
})

test.beforeEach(() => {
  // Setup: create mocks, reset state
})

test.afterEach(() => {
  // Teardown: cleanup
})
```

### Test Patterns

- **Mocking**: Use simple mock classes for WebSocket, databases
- **Async/await**: All async operations should be properly awaited
- **assert module**: Use `assert.equal()`, `assert.ok()`, `assert.deepStrictEqual()`
- **Timeouts**: Use `waitFor()` helper with explicit timeouts

---

## Adding a New Connector

### 1. Create Connector File

```typescript
import type { PlatformConnector, ConnectorInstance, InboundMessage } from './types'

const myplatform: PlatformConnector = {
  async start(connector, credential, onMessage): Promise<ConnectorInstance> {
    const botToken = connector.config.botToken
    console.log(`[myplatform] Starting: ${connector.name}`)
    
    // Initialize connection
    const messageHandler = (msg: any) => {
      const inbound: InboundMessage = {
        platform: 'myplatform',
        channelId: msg.channelId,
        senderId: msg.senderId,
        text: msg.text,
      }
      const response = await onMessage(inbound)
      
      if (!isNoMessage(response)) {
        // Send response back
        await sendResponse(msg.channelId, response)
      }
    }
    
    // Start listening
    // Listen for messages and call messageHandler
    
    return {
      connector,
      async sendMessage(channelId, text, options) {
        console.log(`[myplatform] Sending to ${channelId}:`, text.slice(0, 50))
        // Send message to platform
      },
      async stop() {
        console.log('[myplatform] Stopped')
        // Cleanup
      },
    }
  },
}
export default myplatform
```

### 2. Register in manager

Add to connector map in `manager.ts`:

```typescript
import myplatform from './myplatform'

const PLATFORMS: Record<string, PlatformConnector> = {
  telegram,
  discord,
  // ... others
  myplatform,
}
```

---

## Database Schema

### Connector Structure

```typescript
interface Connector {
  id: string              // UUID (genId())
  name: string
  platform: 'telegram' | 'discord' | 'slack' | 'whatsapp' | 'openclaw' | 'bluebubbles'
  agentId?: string       // Link to an agent
  chatroomId?: string     // Link to a chatroom
  credentialId?: string
  config: {
    botToken?: string,
    proxy?: string,         // HTTP proxy URL
    chatIds?: string,        // Comma-separated list
    wsUrl?: string,         // WebSocket URL (OpenClaw)
    historyPoll?: boolean,
    historyPollMs?: number,
  }
  isEnabled: boolean
  status: 'stopped' | 'running' | 'error'
  lastError?: string
  createdAt: number
  updatedAt: number
}
```

### Session Structure

```typescript
interface Session {
  id: string              // Session ID (genId())
  name: string
  cwd?: string
  user: string
  provider: ProviderType
  model: string
  credentialId?: string
  apiEndpoint?: string | null
  claudeSessionId: string | null
  codexThreadId?: string | null
  opencodeSessionId?: string | null
  agentId?: string | null
  parentSessionId?: string | null
  messages: Message[]
  createdAt: number
  lastActiveAt: number
  active?: boolean
}
```

---

## API Route Patterns

```typescript
// GET /api/endpoint
export async function GET(_req: Request) {
  const data = getData()
  return NextResponse.json(data)
}

// POST /api/endpoint
export async function POST(req: Request) {
  const body = await req.json()
  // Process body
  return NextResponse.json({ success: true })
}

// Error handling
export async function POST(req: Request) {
  try {
    const result = await doWork()
    return NextResponse.json(result)
  } catch (err: unknown) {
    console.error('[endpoint] Error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
```

---

## State Management

SwarmClaw uses **Zustand** for global state:

```typescript
// Reading state
import { useAppStore } from '@/stores/use-app-store'

const currentUser = useAppStore((s) => s.currentUser)
const sessions = useAppStore((s) => s.sessions)

// Mutating state
useAppStore.setState({ activeView: 'agents' })

// Async mutations
const loadSessions = useAppStore((s) => s.loadSessions)
const setCurrentSession = useAppStore((s) => s.setCurrentSession)
```

---

## WebSocket Integration

Real-time updates via WebSocket:

```typescript
import { connectWs } from '@/lib/ws-client'

// Connect on mount
useEffect(() => {
  const key = getStoredAccessKey()
  if (key) connectWs(key)
  return () => disconnectWs()
}, [])

// Listen for updates
useWs('sessions', loadSessions, 5000)
useWs('connectors', loadConnectors, 5000)
useWs('agents', loadAgents, 5000)
```

---

## Important Notes

1. **Security**: Never commit credentials or API keys. Use `.env.local` or Secrets management UI
2. **Database migrations**: SQLite used directly - handle carefully
3. **Proxy support**: Connectors support `config.proxy` (HTTP format)
4. **Error handling**: Always catch errors in connectors, set `lastError` field
5. **Type safety**: Use TypeScript strict mode - prefer specific types over `any`
6. **Testing**: Use Node.js built-in `test` framework with `assert`
7. **Theming**: Support for light/dark themes via CSS variables

---

## Common Patterns

### Type Guards

```typescript
function isConnector(connector: unknown): connector is Connector {
  return connector && typeof connector === 'object' && 'id' in connector && 'platform' in connector
}

function hasText(message: unknown): message is { text: string } {
  return typeof message === 'object' && 'text' in message && typeof message.text === 'string'
}
```

### Async Timeout Helper

```typescript
async function waitFor<T>(
  getValue: () => T | null | undefined,
  timeoutMs = 2_000
): Promise<T> {
  const started = Date.now()
  while (Date.now() - started <= timeoutMs) {
    const value = getValue()
    if (value) return value
    await new Promise((resolve) => setTimeout(resolve, 10))
  }
  throw new Error(`waitFor timed out after ${timeoutMs}ms`)
}
```

### Logging Convention

```typescript
// Feature prefix for easy grep filtering
console.log('[feature] Action:', action)
console.error('[feature] Error:', error)
console.warn('[feature] Warning:', warning)

// For connectors, log connection status
console.log('[platform] Status:', status)
console.log('[platform] Message from:', user)
```

---

## Troubleshooting

### Dev Server Issues

```bash
# Port conflict
lsof -i :3456
kill -9 <PID>

# Rebuild after type changes
rm -rf .next
npm run dev:clean
```

### Common Errors

| Error | Solution |
|--------|----------|
| `Module not found` | Check `tsconfig.json` paths, verify installation |
| `EADDRINUSE` | Check for conflicts: `lsof -i :3456` |
| `Connector failed to start` | Check `lastError` field, verify network/proxy |
| `Timeout` | Check API rate limits, increase timeout values |

---

## Environment Variables

Required variables (set in `.env.local`):

```bash
# Access control
ACCESS_KEY=your-random-access-key-here

# Optional: provider-specific
# OPENCLAW_API_ENDPOINT=https://api.openclaw.ai/v1
# OPENCLAW_GATEWAY_TOKEN=your-gateway-token
```

---

## Development Workflow

1. **Create feature branch**: `git checkout -b feature/my-new-feature`
2. **Make changes**: Edit files, add tests
3. **Lint and build**: `npm run lint && npm run build`
4. **Test**: `npm run test:openclaw`
5. **Commit**: `git add . && git commit -m "feat: my change"`
6. **Push**: `git push origin feature/my-new-feature`

---

## Related Files

| File | Purpose |
|------|---------|
| `package.json` | Scripts and dependencies |
| `tsconfig.json` | TypeScript compiler options |
| `eslint.config.mjs` | ESLint configuration |
| `next.config.ts` | Next.js configuration |
| `.env.local` | Environment variables (gitignored) |

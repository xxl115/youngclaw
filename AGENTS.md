# SwarmClaw - AI Agent Development Guide

This guide helps AI agents (like yourself) work effectively with the SwarmClaw codebase.

## Quick Start

```bash
# Clone and install
git clone https://github.com/xxl115/youngclaw.git
cd youngclaw
npm install

# Start dev server
npm run dev

# Run a single test (e.g., connector tests)
npm run test:openclaw -- --grep "connector"
```

---

## Code Style Guidelines

### TypeScript Configuration

- **Strict mode enabled** - `tsconfig.json` has `"strict": true`
- **Target**: ES2017, ESNext
- **JSX**: `react-jsx`
- Always use proper typing - avoid `any` unless necessary
- Use proper imports over `require()`

### Import Organization

```typescript
// Group 1: External libraries (no relative path)
import { Bot } from 'grammy'
import { NextResponse } from 'next/server'

// Group 2: Internal modules (relative path with @/ alias)
import type { Connector } from '@/types'
import { loadConnectors } from '@/lib/server/storage'

// Group 3: React
import { useState, useEffect } from 'react'
import { useAppStore } from '@/stores/use-app-store'
```

### Formatting & Style

- **Use shadcn/ui components** - don't reinvent buttons, dialogs, etc.
- **Tailwind CSS** - prefer utility classes over inline styles
- **Avoid inline styles** - use the CSS variable system (`--color-text`, `--background`, etc.)
- **File structure** - one export per file (ESM), named exports for libraries

### Naming Conventions

| Context | Convention | Example |
|----------|------------|----------|
| Components | PascalCase | `ChatInput.tsx`, `AgentSheet.tsx` |
| Functions | camelCase | `loadConnectors()`, `streamOpenAiChat()` |
| Constants | UPPER_SNAKE_CASE | `MAX_ATTEMPTS`, `DEFAULT_TIMEOUT` |
| Interfaces | PascalCase, prefixed with type | `StreamChatOptions`, `ConnectorInstance` |
| React Hooks | `use` prefix | `useAppStore()`, `useWs()` |
| Event Handlers | `handle` prefix | `handleSend()`, `handleKeyDown()` |
| Files | kebab-case | `telegram-connector.ts`, `api-routes.ts` |

### Error Handling

```typescript
// API Routes - return NextResponse.json with error
if (!connector) {
  return notFound()
}

// Async functions - wrap in try/catch, return error response
try {
  const result = await riskyOperation()
  return NextResponse.json(result)
} catch (err: unknown) {
  console.error('Operation failed:', err)
  return NextResponse.json(
    { error: err instanceof Error ? err.message : String(err) },
    { status: 500 }
  )
}

// Logging
console.log(`[feature] Action: ${action}`)
console.error(`[feature] Error: ${error}`)
console.warn(`[feature] Warning: ${warning}`)
```

---

## Architecture Overview

### Project Structure

```
swarmclaw/
├── src/
│   ├── app/                    # Next.js App Router (API routes)
│   ├── components/             # React components
│   ├── lib/                   # Internal libraries
│   │   ├── server/            # Server-side code (API, connectors, storage)
│   │   ├── providers/         # LLM provider implementations
│   │   └── shared/           # Shared utilities
│   ├── stores/                # Zustand state management
│   └── types/                # TypeScript type definitions
├── tests/                    # Node.js tests
└── public/                    # Static assets
```

### Key Modules

| Module | Purpose | Location |
|---------|---------|----------|
| Connectors | Platform integrations (Telegram, Discord, etc.) | `src/lib/server/connectors/` |
| Storage | SQLite persistence | `src/lib/server/storage.ts` |
| Providers | LLM streaming implementations | `src/lib/providers/` |
| Session Manager | Chat session orchestration | `src/lib/server/session-run-manager.ts` |
| WebSocket Hub | Real-time communication | `src/lib/server/ws-hub.ts` |

---

## Adding a New LLM Provider

1. Create provider file: `src/lib/providers/yourprovider.ts`

```typescript
import { streamOpenAiChat } from './openai'
import type { StreamChatOptions } from './index'

export async function streamYourProviderChat(opts: StreamChatOptions): Promise<string> {
  const patchedSession = {
    ...opts.session,
    apiEndpoint: opts.session.apiEndpoint || 'https://api.yourprovider.com/v1',
  }
  return streamOpenAiChat({ ...opts, session: patchedSession })
}
```

2. Register in `src/lib/providers/index.ts`:

```typescript
const PROVIDERS: Record<string, BuiltinProviderConfig> = {
  yourprovider: {
    id: 'yourprovider',
    name: 'Your Provider Name',
    models: ['model-1', 'model-2'],
    requiresApiKey: true,
    requiresEndpoint: false,
    defaultEndpoint: 'https://api.yourprovider.com/v1',
    handler: {
      streamChat: (opts) => streamYourProviderChat(opts),
    },
  },
  // ... existing providers
}
```

3. Add to `src/types/index.ts` ProviderType union:

```typescript
export type ProviderType = 
  | 'claude-cli' | 'codex-cli' | 'opencode-cli' 
  | 'openai' | 'ollama' | 'anthropic' | 'openclaw' 
  | 'google' | 'deepseek' | 'groq' | 'together' | 'mistral' 
  | 'xai' | 'fireworks' | 'zhipu' | 'minimax' | 'moonshot' 
  | 'kilocode' | 'yourprovider'
```

---

## Adding a New Connector

1. Create connector file: `src/lib/server/connectors/yourplatform.ts`

```typescript
import type { PlatformConnector, ConnectorInstance, InboundMessage } from './types'
import { isNoMessage } from './manager'

const yourplatform: PlatformConnector = {
  async start(connector, credential, onMessage): Promise<ConnectorInstance> {
    // Initialize your connection
    console.log(`[yourplatform] Starting connector: ${connector.name}`)

    // Listen for messages
    const messageHandler = (msg: any) => {
      const inbound: InboundMessage = {
        platform: 'yourplatform',
        channelId: msg.channelId,
        senderId: msg.senderId,
        text: msg.text,
      }
      const response = await onMessage(inbound)
      
      if (!isNoMessage(response)) {
        // Send response back
        // yourSendMessageFn(msg.channelId, response)
      }
    }

    // Start listening
    // yourListenFn(messageHandler)

    return {
      connector,
      async sendMessage(channelId, text, options) {
        // Send message to platform
        console.log(`[yourplatform] Sending to ${channelId}:`, text.slice(0, 50))
      },
      async stop() {
        // Cleanup and stop listening
        console.log(`[yourplatform] Stopped`)
      },
    }
  },
}
```

2. Register in `src/lib/server/connectors/manager.ts` by adding to the platform map

---

## Database Schema

Connectors, agents, sessions, and other entities are stored in SQLite:

```typescript
// Connector structure
{
  id: string,           // UUID
  name: string,
  platform: 'telegram' | 'discord' | 'slack' | 'whatsapp',
  agentId?: string,    // Link to an agent
  config: {
    botToken?: string,
    proxy?: string,
    chatIds?: string,
  },
  isEnabled: boolean,
  status: 'stopped' | 'running' | 'error',
  lastError?: string,
}

// Session structure
{
  id: string,           // Session ID (genId())
  name: string,
  agentId: string,
  provider: string,
  cwd?: string,
  user?: string,
  active: boolean,
  queuedCount: number,
}
```

Use `loadConnectors()`, `saveConnectors()` from `src/lib/server/storage.ts`.

---

## Testing

### Running Tests

```bash
# Run all tests
npm run test:cli

# Run specific test file
npm run test:openclaw src/lib/server/connectors/openclaw.test.ts

# Run with grep pattern
npm run test:cli -- --grep "connect"
```

### Test Patterns

- Use `test()` from Node.js built-in test framework
- Use `assert` for assertions
- Use `test.beforeEach()` and `test.afterEach()` for setup/teardown
- For async tests, use `await waitFor()` helper with timeout

Example from `openclaw.test.ts`:
```typescript
const chatReq = await waitFor(() => findReq(ws, 'chat.send'), 2_000)
assert.equal(chatReq.params.message, 'pong')
```

---

## API Route Patterns

API routes follow Next.js App Router conventions:

```typescript
// File: src/app/api/connectors/[id]/route.ts
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const connector = loadConnectors()[id]
  if (!connector) return notFound()
  return NextResponse.json(connector)
}
```

- Use `NextResponse.json()` for JSON responses
- Use `notFound()` for 404s
- Use dynamic exports: `export const dynamic = 'force-dynamic'` for API routes
- Access control is handled in `src/proxy.ts` - check before mutating state

---

## Environment Variables

Required environment variables (set in `.env.local`):

```bash
# Access control
ACCESS_KEY=your-random-key-here

# Optional: provider-specific
# OPENCLAW_API_ENDPOINT=https://claw.xxl185.dpdns.org/v1
# OPENCLAW_GATEWAY_TOKEN=your-gateway-token

# Ports
PORT=3456                    # Dev server port
WS_PORT=3457                # WebSocket server port
```

---

## State Management

SwarmClaw uses **Zustand** for global state:

```typescript
// Access state
import { useAppStore } from '@/stores/use-app-store'

const currentUser = useAppStore((s) => s.currentUser)
const setAgent = useAppStore((s) => s.setEditingAgentId)

// Mutate state
useAppStore.setState({ activeView: 'agents' })

// Persist state to storage
saveConnectors(connectors)
saveSessions(sessions)
```

---

## WebSocket Integration

For real-time updates, use the WebSocket hub:

```typescript
import { connectWs } from '@/lib/ws-client'

// Connect to hub
connectWs(accessKey)

// Listen for updates
useWs('sessions', loadSessions, 5000)
useWs('connectors', loadConnectors, 5000)
```

---

## Important Notes

1. **Security**: Never commit credentials or API keys. Use `.env.local` or the Secrets management UI.
2. **Database migrations**: SQLite is used directly - no ORM, use migrations carefully.
3. **Proxy Support**: Telegram connectors support `config.proxy` for HTTP proxies (e.g., `http://127.0.0.1:7890`).
4. **No server-side sessions**: State is client-side; server stores session metadata but not user data.
5. **Error handling**: Always catch errors in connectors and log them. Failed operations should set `lastError`.
6. **Rate limiting**: Proxy middleware in `src/proxy.ts` enforces rate limits based on IP and failed attempts.

---

## Common Patterns

### Async Operation with Timeout

```typescript
import { waitFor } from './tests/timeout-helper'

const result = await waitFor(
  () => getWebSocketInstance(),
  1_000,  // timeout in ms
)
```

### Safe Database Access

```typescript
const db = new Database('./data/swarmclaw.db', { readonly: true })

// Always close connections
const stmt = db.prepare('SELECT * FROM connectors WHERE id = ?')
const connector = stmt.get(id)
db.close()  // Explicitly close
```

### Type Guards

```typescript
function isConnector(connector: any): connector is Connector {
  return connector && 'id' in connector && 'platform' in connector
}

function hasText(message: InboundMessage): message is InboundMessage & { text: string } {
  return 'text' in message && typeof message.text === 'string'
}
```

---

## Troubleshooting

### Dev Server Issues

```bash
# Port already in use
lsof -i :3456
kill -9 <PID>

# Rebuild after type changes
rm -rf .next
npm run dev:clean
```

### Common Errors

| Error | Solution |
|--------|----------|
| `Module not found` | Check `tsconfig.json` paths and imports |
| `cannot resolve '@/types'` | Ensure importing from `src/` not `lib/` |
| `Connector failed to start` | Check `lastError` field in connector, check network/proxy |
| `WebSocket connection failed` | Ensure proxy is configured and reachable |

---

## Related Files

| File | Purpose |
|------|---------|
| `package.json` | Scripts and dependencies |
| `tsconfig.json` | TypeScript compiler options |
| `eslint.config.mjs` | ESLint configuration |
| `next.config.ts` | Next.js configuration (PWA, webpack) |
| `.env.local` | Environment variables (gitignored) |

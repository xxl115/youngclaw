---
name: OpenClaw SwarmClaw Bridge
description: Operate SwarmClaw from an OpenClaw-backed agent and coordinate cross-session work. Use when the task needs OpenClaw provider setup, inter-session delegation, platform task/schedule management, connector automation, or secret/memory persistence across runs.
---

# OpenClaw SwarmClaw Bridge

Use this workflow when coordinating work between OpenClaw and SwarmClaw.

## 1) Verify Connectivity First

Check these before execution:

- SwarmClaw UI/API is reachable (`http://localhost:3456` by default).
- OpenClaw gateway is reachable (`http://127.0.0.1:18789` by default).
- OpenClaw Chat Completions endpoint is enabled:
  - `gateway.http.endpoints.chatCompletions.enabled: true`
- OpenClaw provider endpoint in SwarmClaw uses `/v1`:
  - `http://127.0.0.1:18789/v1`
- Token auth is configured when gateway auth mode requires it.

## 2) Execution Order for Agentic Work

For broad goals (research, build, outreach, monetization):

1. Use `sessions_tool` with `action: "list"` to discover active sessions.
2. Decide whether to reuse an active session or `spawn` a focused sub-session.
3. Use `send` with explicit success criteria and expected output format.
4. Track long-lived work via:
   - `manage_tasks` (state + ownership)
   - `manage_schedules` (follow-up / recurring checks)
5. Persist durable context:
   - `memory_tool` for decisions/outcomes
   - `manage_secrets` for reusable credentials/tokens

Do not stop at one app/one idea unless blocked by explicit external constraints.

## 3) Delegation Prompt Pattern

When sending work to another session, include:

- objective
- constraints
- output contract
- definition of done

Example contract:
"Return JSON with `result`, `evidence`, `nextActions`."

## 4) Failure Handling

If a step fails:

- retry once with a narrower prompt
- if still failing, switch approach/session
- log blocker in `manage_tasks` and schedule follow-up if needed
- only ask the user when an external permission/credential is required

## 5) Secret Hygiene

When an account/token is created during execution:

- store it immediately with `manage_secrets`
- scope to agent when possible (`scope: "agent"`)
- reference by secret name in future steps instead of asking again

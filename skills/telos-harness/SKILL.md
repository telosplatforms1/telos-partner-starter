---
name: telos-harness
description: Set up or use Telos in a coding agent, including model selection, connected tools, reconnects, memory, and troubleshooting in the active harness.
license: MIT
metadata:
  author: Telos
  version: "1.0.0"
---

# Telos in your coding agent

Help with the user's actual harness and requested task. For app development against Telos APIs, use the bundled `build-with-telos` skill instead. Installing these skills does not grant permissions, connect memory folders, or select a model.

## Start with the active setup

Identify the running harness/version, profile, effective configuration and Telos environment. An installed executable is not evidence of an active session. Check existing state before proposing setup; a working connection needs no reinstallation. Read only the relevant harness reference:

| Harness | Reference |
|---|---|
| Hermes | [Profiles, native setup and discovery](references/hermes.md) |
| OpenCode | [Configuration, Code Mode and cached tools](references/opencode.md) |
| Pi | [Deferred discovery and reload](references/pi.md) |
| Claude Code | [Gateway models and managed settings](references/claude.md) |
| OpenClaw | [Chat, gateways and workspaces](references/openclaw.md) |
| Codex | [Connectors with the existing inference provider](references/codex.md) |
| Aider | [Inference and model roles](references/aider.md) |

## Connection and everyday use

- For initial setup or a requested change, open the target Telos environment's `/platform/api-keys/connect` page and use its generated command. The existing installer handles browser consent, exact model discovery, native settings and skill installation. Do not invent download hosts or replace it with a wrapper, proxy, provider patch, or separate credential store. Report missing harness/uv prerequisites.
- Discover exact callable model/router IDs with authenticated `/v1/models`; use `/v1/catalog` for supported metadata. Preserve the user's choice and effective native overrides. Reuse setup with the chosen ID to update native defaults, then check a fresh session. A saved default alone does not prove which model answered. Do not issue paid inference merely to check configuration unless requested.
- For connected-account tasks, discover the available tools, their schemas and account bindings using the harness's native discovery. Follow the shared MCP instructions and existing user choices. Do not copy tool catalogs into this skill, guess names/arguments, or interpret an empty resource listing as missing tools.
- Read access and delegated actions require their respective explicit grants in setup. Installing a skill does not request either. Keep native permissions and denials binding; never route a denied action through another integration. For an uncertain write outcome, inspect the result before retrying.
- Separate an expired Telos key from an expired connected account. For a Telos 401, rerun the existing authorization flow; never print keys or put secrets in arguments. For account recovery, follow the returned browser connection link, wait for completion, refresh discovery and retry the requested read. Do not switch accounts or grant broader scopes to hide errors.
- When tools or defaults look stale, use the reference's native refresh mechanism. Explain when a new session is needed; do not restart a user's running harness without authorization.

## Memory when relevant

Connected memory profiles and future supported file changes sync automatically while the desktop engine or CLI is running. Do not ask connected users to repeat setup or review each upload. For initial connection, learning-mode changes, project memory, sync errors or undo, read [Memory setup and recovery](references/memory.md) and the relevant [curated sources](references/memory-sources.md).

## Verify and undo

Distinguish files saved on disk, native discovery, an active session, and a live model/tool call. Verify the requested boundary using non-mutating discovery first. Report what changed, the affected profile, live versus mocked checks, remaining failures and how to undo. Preserve unrelated providers, tools, native memory, credentials and conversations. Restore only Telos-owned settings or unchanged skill files; use private backups without overwriting subsequent user edits. Revoke keys separately through Telos when requested.

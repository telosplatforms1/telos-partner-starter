---
name: telos-harness
description: Set up or use Telos in a coding agent, including model selection, connected tools, reconnects, memory, and troubleshooting in the active harness.
license: MIT
metadata:
  author: Telos
  version: "1.1.0"
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

## First connection, including users without an account

Installing the skills or using managed `launch` does not require a Telos account. Telos inference, connected tools and memory require an authenticated connection; installation alone does not enable them.

1. Share the target environment's `/platform/api-keys/connect` link. Users without an account should follow its account-creation entry point. The current Platform signup page shows a waitlist: if access requires approval or an invitation, guide the user through that step and wait for access before continuing. Once access is available, finish signup and any required workspace setup, then return to the connection page. Use the same Telos environment throughout.
2. Have the user select their harness and requested features, then run the page's generated command in their terminal. Report missing harness/uv prerequisites. The existing installer handles browser consent, exact model discovery, native settings and skill installation; do not invent download hosts, wrappers or a separate credential store.
3. If setup opens browser approval before they have an account, choose **Create a Telos account** there and follow the environment's signup/access requirements. Once access is available, finish signup, follow **Complete setup** if workspace setup is required, then return to approval. Review the workspace and requested permissions and choose **Authorize** for their harness. Return to the terminal to finish. Keep passwords and API keys out of chat.

Browser approval currently waits **three minutes**. If the terminal reports `authorization_timeout` / “Browser approval timed out,” finish signup and workspace setup first, then rerun the same generated setup command. Use the newly opened approval page or new URL printed by that run; the old callback is no longer listening. Stay signed in to the same environment so the retry can proceed directly to approval. A timeout leaves the harness connection unsaved; it does not undo a completed account signup. Do not restart signup or reinstall the harness just to retry approval.

## Connection and everyday use

- For requested connection changes, reuse the connection page's generated command and the existing installer; do not replace it with a proxy or provider patch.
- Use the managed `launch` command in the public repository README for future sessions; it loads the installer and bundle from `https://github.com/telosplatforms1/telos-partner-starter/releases/latest/download/`. It refreshes both skills before starting the native harness, without changing inference settings or requesting new consent. Older environment-hosted commands follow that deployment; switch to the published command to follow public releases. A locally edited skill (including added/deleted files) is preserved as a whole and reported; clean skills still update. Restore its original files or move the edited directory aside to resume updates. Download/validation/write failures stop the launch with a typed error. Bare harness commands bypass refresh; pass native arguments after `--`. A version-pinned bundle stays pinned.
- Discover exact callable model/router IDs with authenticated `/v1/models`; use `/v1/catalog` for supported metadata. Preserve the user's choice and effective native overrides. Reuse setup with the chosen ID to update native defaults, then check a fresh session. A saved default alone does not prove which model answered. Do not issue paid inference merely to check configuration unless requested.
- For connected-account tasks, discover the available tools, their schemas and account bindings using the harness's native discovery. Follow the shared MCP instructions and existing user choices. Do not copy tool catalogs into this skill, guess names/arguments, or interpret an empty resource listing as missing tools.
- Read access and delegated actions require their respective explicit grants in setup. Installing a skill does not request either. Keep native permissions and denials binding; never route a denied action through another integration. For an uncertain write outcome, inspect the result before retrying.
- Separate an expired Telos key from an expired connected account. For a Telos 401, rerun the existing authorization flow; never print keys or put secrets in arguments. For account recovery, follow the returned browser connection link, wait for completion, refresh discovery and retry the requested read. Do not switch accounts or grant broader scopes to hide errors.
- When tools or defaults look stale, use the reference's native refresh mechanism. Explain when a new session is needed; do not restart a user's running harness without authorization.

## Memory when relevant

Connected memory profiles and future supported file changes sync automatically while the desktop engine or CLI is running. Do not ask connected users to repeat setup or review each upload. For initial connection, learning-mode changes, project memory, sync errors or undo, read [Memory setup and recovery](references/memory.md) and the relevant [curated sources](references/memory-sources.md).

## Verify and undo

Distinguish files saved on disk, native discovery, an active session, and a live model/tool call. Verify the requested boundary using non-mutating discovery first. Report what changed, the affected profile, live versus mocked checks, remaining failures and how to undo. Preserve unrelated providers, tools, native memory, credentials and conversations. Restore only Telos-owned settings or unchanged skill files; use private backups without overwriting subsequent user edits. Revoke keys separately through Telos when requested.

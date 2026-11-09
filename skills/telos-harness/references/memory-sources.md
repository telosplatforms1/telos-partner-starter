# Curated memory sources

The sync engine reads approved UTF-8 `.md`/`.txt` files; it does not interpret sessions or generate memories. Connect the actual installation/profile once; memory sync needs no content review. Directory watchers plus periodic reconciliation upload revisions. Missing roots and failed scans do not delete cloud data.

| Harness | Automatic source | Limits |
|---|---|---|
| Hermes | Active profile's `memories/`; honor `HERMES_HOME` | `MEMORY.md` and `USER.md`; preserve native learning. |
| Claude Code | Explicit `autoMemoryDirectory`; otherwise managed memory with user-level rules | Preserve existing project auto-memory and native settings. |
| Codex | Previously enrolled source; otherwise managed memory with native developer instructions | Keep the existing inference provider. Grant only the managed directory as an additional writable root; retain native sandbox/approval policy. |
| Pi | Managed memory, with a marked block in the active global instruction file | Honor `PI_CODING_AGENT_DIR`; preserve existing global and project instructions. |
| OpenCode | Managed memory, loaded through native `instructions` configuration | Preserve existing plugins and instructions. |
| OpenClaw | Active workspace reported by native metadata | Only curated `MEMORY.md` and `USER.md`; exclude daily logs and other workspace files. |
| Aider | Telos conversation memory through inference | No file sync, editable memory files, or Git-setting changes. |

Explicit `--memory-root`, `--memory-profile`, and `--memory-files` remain advanced overrides for file-capable harnesses. Otherwise setup reuses the enrolled source for the verified account, environment, and active profile, then considers verified native configuration. Ambiguous native candidates use managed storage without a folder picker. Managed storage is isolated beside the per-key encrypted service state and contains `MEMORY.md` plus a nonsecret `capture.json` status; only the memory file is uploaded.

Read only selected memory roots, never whole home/configuration directories. Symlinked files or directory escapes, invalid UTF-8, NUL bytes, and files larger than 128 KiB are rejected. Sync status reports these errors without silent truncation. Each file becomes a separately attributed source. Connecting a curated directory includes future supported files automatically, unless an explicit file list limits the connection. Changes need no further review. Native file writes, history, and memory controls remain owned by the harness.

## Authoritative references

- [Hermes persistent memory](https://hermes-agent.nousresearch.com/docs/user-guide/features/memory) and [profiles](https://hermes-agent.nousresearch.com/docs/user-guide/profiles)
- [Claude Code memory](https://code.claude.com/docs/en/memory)
- [Codex memory implementation](https://github.com/openai/codex/tree/main/codex-rs/memories) and [consolidated file contract](https://github.com/openai/codex/blob/main/codex-rs/memories/write/templates/memories/consolidation.md)
- [Pi settings](https://pi.dev/docs/latest/settings) and [packages](https://pi.dev/docs/latest/packages)
- [OpenCode plugins](https://opencode.ai/docs/plugins/) and [configuration](https://opencode.ai/docs/config/)

Recheck documentation when a harness version changes. These are format contracts, not a claim that every installed version has been exercised live.

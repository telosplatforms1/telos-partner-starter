# Curated memory sources

The sync engine reads approved UTF-8 `.md`/`.txt` files; it does not interpret sessions or generate memories. Connect the actual installation/profile once; memory sync needs no content review. Directory watchers plus periodic reconciliation upload revisions. Missing roots and failed scans do not delete cloud data.

| Harness | Supported source | Discovery and limits |
|---|---|---|
| Hermes | `MEMORY.md`, `USER.md` in the active profile's `memories/` directory | `HERMES_HOME` overrides `~/.hermes`. Select other profile roots explicitly. Keep native memory enabled. |
| Claude Code | `MEMORY.md` plus selected topic `.md` files in the auto-memory directory | Default `~/.claude/projects/<project>/memory/`; `CLAUDE_CONFIG_DIR` and `autoMemoryDirectory` can change it. Select custom locations explicitly. `CLAUDE.md` is an instruction file. |
| Codex | `MEMORY.md`, `memory_summary.md` in the configured memory root | Default `$CODEX_HOME/memories`, normally `~/.codex/memories`. Exclude `raw_memories.md`, `rollout_summaries/`, sessions, skills, and internal SQLite databases. An empty memory directory is valid. Upload support does not add Responses API compatibility to Telos. |
| Pi | Selected curated files or a supported text export from the installed memory extension | There is no assumed universal memory source. Respect `PI_CODING_AGENT_DIR` and the extension's documentation. An installation without a memory extension may have nothing to sync. |
| OpenCode | Selected curated files or a supported text export from the installed memory plugin | Inspect the actual plugin and effective configured location. `AGENTS.md` is an instruction file, not a memory export. |
| Other | Explicitly selected curated `.md`/`.txt` files | Unsupported structured/database formats must use a supported export; do not guess their schema. |

Read only selected memory roots, never whole home/configuration directories. Symlinked files or directory escapes, invalid UTF-8, NUL bytes, and files larger than 128 KiB are rejected. Sync status reports these errors without silent truncation. Each file becomes a separately attributed source. Connecting a curated directory includes future supported files automatically, unless an explicit file list limits the connection. Changes need no further review. Native file writes, history, and memory controls remain owned by the harness.

## Authoritative references

- [Hermes persistent memory](https://hermes-agent.nousresearch.com/docs/user-guide/features/memory) and [profiles](https://hermes-agent.nousresearch.com/docs/user-guide/profiles)
- [Claude Code memory](https://code.claude.com/docs/en/memory)
- [Codex memory implementation](https://github.com/openai/codex/tree/main/codex-rs/memories) and [consolidated file contract](https://github.com/openai/codex/blob/main/codex-rs/memories/write/templates/memories/consolidation.md)
- [Pi settings](https://pi.dev/docs/latest/settings) and [packages](https://pi.dev/docs/latest/packages)
- [OpenCode plugins](https://opencode.ai/docs/plugins/) and [configuration](https://opencode.ai/docs/config/)

Recheck documentation when a harness version changes. These are format contracts, not a claim that every installed version has been exercised live.

# Codex

Telos setup supports native Responses inference and native MCP connectors. To retain the user's existing model provider and subscription login, use `--subscription`: setup installs prompt recall hooks and curated memory sync without changing model authentication. Native hook review/trust is required; never bypass it. The existing `--connector-only --sync-memories` combination enables the same integration. Do not substitute a Chat Completions endpoint for Codex's Responses protocol.

Respect `CODEX_HOME`, project trust and managed configuration. The installer writes native MCP configuration to the active Codex config and uses native tool discovery. Installed skills are found through supported Agent Skills directories; check native discovery and refresh/start a new session after changes. Do not force skill contents into developer instructions.

Preserve native approval requirements and disabled tools. Headless execution may deny writes that require an interactive approval interface; do not turn that denial into another execution route. Connected tools work independently of Telos inference memory.

Curated-memory upload supports configured `MEMORY.md`/`memory_summary.md`; exclude raw memories, rollout summaries, sessions and internal databases. Empty memory roots are valid. Subscription setup uses read-only hooks for retrieval into the local conversation, independently of Telos inference. Curated file sync is the sole capture path; recalled context must not be copied back into memory files.

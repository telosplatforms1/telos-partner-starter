# Codex

Telos setup currently supports native MCP connectors while keeping Codex's existing inference provider. Telos does not expose the public Responses ingress required by the verified Codex inference contract. Do not switch its inference configuration to a Chat Completions endpoint or claim memory-file upload adds that protocol.

Respect `CODEX_HOME`, project trust and managed configuration. The installer writes native MCP configuration to the active Codex config and uses native tool discovery. Installed skills are found through supported Agent Skills directories; check native discovery and refresh/start a new session after changes. Do not force skill contents into developer instructions.

Preserve native approval requirements and disabled tools. Headless execution may deny writes that require an interactive approval interface; do not turn that denial into another execution route. Connected tools work independently of Telos inference memory.

Optional curated-memory upload supports configured `MEMORY.md`/`memory_summary.md`; exclude raw memories, rollout summaries, sessions and internal databases. Empty memory roots are valid. Retrieval through Telos applies only to supported Telos inference calls, not automatically to Codex's retained inference provider.

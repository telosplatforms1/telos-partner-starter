# Claude Code

Use `--subscription` to retain the user's existing model login and install automatic Telos prompt recall plus curated memory sync. The existing `--connector-only --sync-memories` options enable the same path. Hooks only retrieve; the file sync service is the sole capture writer. Do not copy recalled Telos facts into local memory. Respect native hook restrictions and restart after setup.

Inspect `CLAUDE_CONFIG_DIR`, managed settings and the current CLI environment. Shared setup uses native settings and the Messages gateway origin without `/v1` because the client adds that path. It manages the Telos bearer credential without copying first-party login state. Environment or project model settings can override saved defaults.

Setup fills user `modelPicker.options` from authenticated Telos discovery, including non-Claude models and routers with their exact IDs. Rerun setup and restart Claude to refresh. Rows described as `From Telos` are setup-owned; personal rows and organization restrictions are preserved. Native automatic discovery filters non-Claude IDs; do not rename IDs to evade that behavior. Picker visibility is not proof of Claude Code feature compatibility. For Anthropic's officially supported gateway use case, choose an exact available Claude model. Respect organization authentication and MCP restrictions; report managed-policy blocks rather than bypassing them. CLI setup does not configure the separate desktop app or editor extension.

Reconnect the Telos server through `/mcp`, or use a fresh session, after account recovery. Keep native permissions and trust settings. Auto-memory is separate from `CLAUDE.md` instructions; inspect the configured auto-memory root, profile overrides and selected topic files for optional sync.

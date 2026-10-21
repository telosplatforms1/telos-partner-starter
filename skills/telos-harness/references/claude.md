# Claude Code

Inspect `CLAUDE_CONFIG_DIR`, managed settings and the current CLI environment. Shared setup uses native settings and the Messages gateway origin without `/v1` because the client adds that path. It manages the Telos bearer credential without copying first-party login state. Environment or project model settings can override saved defaults.

For the documented gateway use case, choose an exact available Claude model from authenticated Telos discovery. A router can choose another model and is not proof of Claude Code feature compatibility. Native gateway pickers may filter the full Telos catalog; do not rename IDs to evade that behavior. Respect organization authentication and MCP restrictions; report managed-policy blocks rather than bypassing them. CLI setup does not configure the separate desktop app or editor extension.

Reconnect the Telos server through `/mcp`, or use a fresh session, after account recovery. Keep native permissions and trust settings. Auto-memory is separate from `CLAUDE.md` instructions; inspect the configured auto-memory root, profile overrides and selected topic files for optional sync.

# OpenCode

Inspect the installed major version and effective configuration. Current verified v2 uses `mcp.servers`, native Code Mode discovery/execution, and `provider.telos.options.apiKey`. Writing a key to the old `auth.json` after v2 database initialization does not configure authentication. Use the shared installer's verified migration instead of duplicating credentials.

Respect `OPENCODE_CONFIG`, XDG roots, project settings and configured skill sources. Do not overwrite commented/JSON5 settings with plain JSON; the installer reports unsupported syntax. A saved user default can be superseded by project or launch settings.

Use `opencode mcp list` for status. Discover tools through Code Mode's actual catalog; do not call an assumed direct tool inside Code Mode. Refresh MCP after reconnecting; when the background service still caches the old catalog, an authorized `opencode service restart` refreshes it. Keep exact native deny rules and coding tools. A denied tool is not permission to switch integrations.

OpenCode has no universal curated memory location; inspect the actual installed memory plugin/export before enabling optional sync.

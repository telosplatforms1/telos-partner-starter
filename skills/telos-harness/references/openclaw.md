# OpenClaw

Respect `OPENCLAW_CONFIG_PATH`, `OPENCLAW_STATE_DIR`, `OPENCLAW_HOME`, configured workspace and per-agent overrides. Shared setup uses the native configuration writer with locking, validation and backups; do not hand-edit managed/read-only settings or run competing writers.

`openclaw chat` runs local embedded chat. `openclaw tui` connects to an existing gateway. Stop/restart a gateway only when authorized and necessary to load changed settings; setup does not install or start a gateway service. Local chat needs exclusive state-directory ownership.

The saved primary model is a Telos provider ID; session model pins and per-agent settings can supersede it. Check a fresh session before concluding the default failed. Discover MCP operations from the active catalog and preserve native tool policies. Shared startup guidance applies to its configured workspace; bootstrap settings or another working directory can change its visibility.

No curated OpenClaw memory format is assumed by this skill. Inspect an explicitly selected supported Markdown/text source rather than syncing a whole workspace or state directory.

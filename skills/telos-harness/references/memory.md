# Memory setup and recovery

Sync is one-way: curated memory files go into Telos without LLM extraction. It does not copy transcripts or write back into another agent. Native learning stays enabled. Upload acknowledgement and retrieval are separate checks.

## Inspect before configuring

For a new connection, use the current harness setup command from Telos Platform with `--sync-memories`. It selects the curated folder, verifies memory-sync access, uploads the initial files, and starts a per-key background service; no desktop-app setup is needed. Use `--memory-root /absolute/path` for an explicit noninteractive selection. For connections previously made in the Telos app, use Settings → Context & memory → Harness memory sync. Inspect connected profiles, selected roots, pending work and acknowledgements. If the desired profile is connected and healthy, later supported edits already sync automatically. Missing roots or scan errors do not imply deletion.

For a new connection, identify the actual profile's [curated sources](memory-sources.md). Select personal or authorized project scope; a directory includes future supported files unless the user limits it to explicit files. Exclude raw transcripts, instruction files, hidden reasoning, secrets and internal databases. No content preview or repeated review is required.

## Key settings and project retrieval

In the API-key manager, inspect the selected key's settings using its owner's authenticated session:

- **Telos learning** (`memory_learning_source: api`) learns from API conversations.
- **Harness learning** (`harness_sync`) retrieves saved context while disabling API conversation extraction. Choose this only when requested or selected in harness onboarding.
- **Memory off** disables retrieval, API capture and key-authorized file uploads. The setup-installed service stays dormant so later re-enabling Harness learning resumes sync automatically.

For project uploads, also bind the inference key's `memory_project_id` to the same authorized project. An unbound key retrieves personal context only. Do not change the project or key merely because uploads succeed. A dedicated key per harness makes changes easier to scope. `X-Telos-Context` describes retrieval; `X-Telos-Memory: disabled` can be normal in Harness learning.

## CLI alternative

The source-distributed CLI is `desktopApp/memorySyncCli.js` in a Telos checkout, also included in the desktop distribution. It requires Node.js 22+ and macOS Keychain or Linux Secret Service (`secret-tool`). The official harness setup installs the same CLI in its environment-specific runtime directory and connects its encrypted authorization. Locate the actual installed file rather than inventing a package/download. From its containing directory:

```sh
node memorySyncCli.js help
node memorySyncCli.js discover
node memorySyncCli.js add --harness hermes --profile default --root /absolute/path/to/memories
node memorySyncCli.js status
node memorySyncCli.js run
```

`help` and `discover` are read-only. Authenticated commands use the setup-created encrypted authorization when given its `--state PATH`, or privately configured `TELOS_API_URL` and `TELOS_API_KEY` with `memory:sync`; never request the key in chat. Add `--project <authorized-project-UUID>` for project uploads and `--files a.md,b.md` only to limit selection. `add` performs an initial batch; `once` processes one bounded batch. Keep `run` running for ongoing sync. The outbox and setup-created authorization are encrypted with OS-protected keys. Read-only `status` can inspect the running service. Stop it before other manual CLI commands; a second writer is rejected.

## Recovery and removal

Check the source acknowledgement, pending/error state, selected key mode and project binding before claiming success. Do not issue paid inference solely for setup verification unless requested. Integrated background setup requires a logged-in macOS user session or a Linux user systemd session with Secret Service. Missing runtime, secure storage, permission, folder or service errors stop setup explicitly; do not claim memory sync is active after a failure.

Pause or disconnect a profile with the panel or `action --connection UUID --action pause|resume|disconnect`. This retains cloud copies. Source-level `action --source UUID --action forget` deletes its cloud copy and suppresses reupload until explicit `restore`; preserve its identity. Native files remain untouched. The setup-installed service polls the key mode every 30 seconds: Harness learning enables file scans and uploads; Telos learning or memory off pauses them. The API enforces that policy for every upload. Telos learning requires a connection configured for Telos inference; keeping another provider is incompatible. Older installations need setup once to prepare automatic switching and migrate their existing source state. Returning a key to Telos learning does not remove imported context. To stop all memory use for a key, turn Memory off and independently disconnect file sources if requested.

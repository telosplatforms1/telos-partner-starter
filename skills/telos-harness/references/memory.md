# Memory setup and recovery

Sync is one-way: curated memory files go into Telos without LLM extraction. It does not copy transcripts or write back into another agent. Native learning stays enabled. Upload acknowledgement and retrieval are separate checks.

## Inspect before configuring

Use Settings → Context & memory → Harness memory sync in the Telos macOS app. Inspect connected profiles, selected roots, pending work and acknowledgements. If the desired profile is connected and healthy, later supported edits already sync automatically. Missing roots or scan errors do not imply deletion.

For a new connection, identify the actual profile's [curated sources](memory-sources.md). Select personal or authorized project scope; a directory includes future supported files unless the user limits it to explicit files. Exclude raw transcripts, instruction files, hidden reasoning, secrets and internal databases. No content preview or repeated review is required.

## Key settings and project retrieval

In the API-key manager, inspect the selected key's settings using its owner's authenticated session:

- **Telos learning** (`memory_learning_source: api`) learns from API conversations.
- **Harness learning** (`harness_sync`) retrieves saved context while disabling API conversation extraction. Choose this only when requested or selected in harness onboarding.
- **Memory off** disables retrieval and API capture for that key; device file-sync controls remain separate.

For project uploads, also bind the inference key's `memory_project_id` to the same authorized project. An unbound key retrieves personal context only. Do not change the project or key merely because uploads succeed. A dedicated key per harness makes changes easier to scope. `X-Telos-Context` describes retrieval; `X-Telos-Memory: disabled` can be normal in Harness learning.

## CLI alternative

The source-distributed CLI is `desktopApp/memorySyncCli.js` in a Telos checkout, also included in the desktop distribution. It requires macOS Keychain and Node.js 22+. Locate the actual installed file; if absent, use the desktop panel rather than inventing a package/download. From its containing directory:

```sh
node memorySyncCli.js help
node memorySyncCli.js discover
node memorySyncCli.js add --harness hermes --profile default --root /absolute/path/to/memories
node memorySyncCli.js status
node memorySyncCli.js run
```

`help` and `discover` are read-only. Authenticated commands require privately configured `TELOS_API_URL` and `TELOS_API_KEY` with `memory:sync`; never request the key in chat. Add `--project <authorized-project-UUID>` for project uploads and `--files a.md,b.md` only to limit selection. `add` performs an initial batch; `once` processes one bounded batch. Keep `run` running for ongoing sync. The outbox is encrypted; credentials are not stored by the CLI. Do not run a second CLI process against the same state file.

## Recovery and removal

Check the source acknowledgement, pending/error state, selected key mode and project binding before claiming success. Do not issue paid inference solely for setup verification unless requested. Linux users can use supported Telos inference/connectors, but this file-sync client currently requires macOS.

Pause or disconnect a profile with the panel or `action --connection UUID --action pause|resume|disconnect`. This retains cloud copies. Source-level `action --source UUID --action forget` deletes its cloud copy and suppresses reupload until explicit `restore`; preserve its identity. Native files remain untouched. Returning a key to Telos learning does not remove imported context. To stop all memory use for a key, turn Memory off and independently disconnect file sources if requested.

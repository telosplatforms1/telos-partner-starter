# Telos Skills

One install provides two focused Agent Skills:

- **build-with-telos** helps developers build apps with Telos authentication, the Assistant and Inference APIs, connected context, and the Telos UI kit, or migrate existing model calls.
- **telos-harness** helps people connect and use Telos in coding agents: model selection, connected tools, account recovery, optional memory setup, and troubleshooting. It includes focused guidance for Hermes, OpenCode, Pi, Claude Code, OpenClaw, Codex, and Aider.

## Install both with one command

Run this from your project with Node.js 22.20 or newer and npm available:

```sh
npx skills add telosplatforms1/telos-partner-starter --skill build-with-telos telos-harness
```

Choose your assistant in the installer's prompts. For a noninteractive project-scoped Codex installation:

```sh
npx --yes skills@latest add telosplatforms1/telos-partner-starter --skill build-with-telos telos-harness --agent codex --yes --copy
```

The second command copies both complete skills into the project without changing your global agent profile. Other assistants can be selected with the installer's supported agent options. Refresh skill discovery or start a fresh session after installation.

## One ZIP download

[Download the latest Telos Skills](https://github.com/telosplatforms1/telos-partner-starter/releases/latest/download/telos-skills.zip) and its [SHA-256 checksum](https://github.com/telosplatforms1/telos-partner-starter/releases/latest/download/telos-skills.zip.sha256).

The archive includes both skill directories and a versioned file/checksum manifest. Verify the download before copying the complete directories into your assistant's supported skill location:

```sh
shasum -a 256 -c telos-skills.zip.sha256
```

Keep references, scripts, metadata, and license files together. The repository also uses the [Agent Skills format](https://agentskills.io/specification), so the same directories work with other compatible assistants. Installation makes guidance available; it does not grant API permissions, provision credentials, connect memory folders, or run model calls.

## Use

> Use build-with-telos to add Telos chat to this app. Keep the existing framework and login.

> Use build-with-telos to migrate this app from OpenRouter to Telos. Prefer an enabled router and keep our existing SDK, UI, and login.

> Use telos-harness to inspect my current Pi connection and help me use my Telos tools.

> Use telos-harness to diagnose why my project memories are not available.

The skills load only the references relevant to the task. Connected memory profiles sync automatically while their sync client is running; the harness skill provides optional setup and recovery guidance.

## Managed harness launch

Use this command for future Pi sessions (replace `pi` with your installed harness):

```sh
uv run --script https://github.com/telosplatforms1/telos-partner-starter/releases/latest/download/telos-harness.py launch pi --skills-url https://github.com/telosplatforms1/telos-partner-starter/releases/latest/download/telos-skills.zip
```

Each managed launch downloads the latest published skills, verifies the manifest, and starts the real harness with its existing provider and credentials. It can install the skills without account setup. Locally edited skills are kept intact and reported, including additions and deletions; other clean skills update. Restore the original files or move the customized directory aside to resume its updates. Download/validation failures stop the launch with an error. Pass native harness arguments after `--`, and set profile-directory environment overrides before launching.

Existing commands using a Telos environment's `/install/` assets follow that deployment; switch once to the published command above to follow public releases. Bare harness commands do not refresh skills. Version-pinned release URLs stay pinned.

Initial Telos account/tool setup uses the same public installer with your environment's explicit API origin, for example:

```sh
uv run --script https://github.com/telosplatforms1/telos-partner-starter/releases/latest/download/telos-harness.py pi --base-url https://app.telosplatforms.com/v1 --skills-url https://github.com/telosplatforms1/telos-partner-starter/releases/latest/download/telos-skills.zip --connector-only --connectors
```

This preserves the inference provider and requests connector reads through browser consent. Optional memory setup uses `--sync-memories`; its runtime is included as a separate public release asset. Account setup is independent of installing or refreshing skills.

The app skill recommends enabled routers first: **Orbit** for balanced use, **Zenith** for quality, **Warp** for speed, and **Slingshot** for cost. It discovers workspace availability and exact IDs, preserves explicit model choices, and confirms fixed-model-to-router migrations.

## Requirements and limits

- App integrations require the target deployment's documented API access and privately configured server credentials where applicable. Managed social login and context OAuth need approved partner registration. Missing access is reported as a setup dependency.
- The React UI kit is a separate artifact, described in the app skill's UI reference. Installing these skills does not install that package or a backend.
- Use the harness setup command generated by your Telos environment. Environments whose command includes `--skills-url` install both skills as part of setup; the command above also installs them independently.
- Codex uses Telos connectors while retaining its existing inference provider. Aider's verified integration supports inference and reference material; it has no supported native Agent Skills or MCP loader.
- Optional curated memory sync requires Node.js 22+, supported profile files, and OS secure storage on macOS or Linux. Pi and OpenCode need a supported memory extension/export. Each harness keeps its own tools, history, and native memory.
- Capabilities depend on the target environment's [public API contract](https://app.telosplatforms.com/api/public/openapi.json), enabled permissions, and actual installed harness version. The skills distinguish configuration, mocked checks, and live verification.

MIT licensed. The license covers these skill files, not Telos services, UI-kit artifacts, trademarks, or third-party dependencies.

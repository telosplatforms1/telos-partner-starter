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

[Download the staging-compatible 1.2.2 bundle](https://github.com/telosplatforms1/telos-partner-starter/releases/download/skills-v1.2.2/telos-skills.zip) and its [checksum](https://github.com/telosplatforms1/telos-partner-starter/releases/download/skills-v1.2.2/telos-skills.zip.sha256). The latest link above remains production-compatible.

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

## One-time harness setup

Copy the setup command from your Telos environment’s connection page. The page downloads the installer and bundles from this repository’s latest public release, while its explicit `--base-url` keeps authorization and API calls in your selected environment. The shell and PowerShell bootstraps install uv when needed.

For macOS / Linux with the production API:

```sh
(s=$(curl -fsSL 'https://github.com/telosplatforms1/telos-partner-starter/releases/latest/download/setup.sh') && sh -c "$s" -- 'https://github.com/telosplatforms1/telos-partner-starter/releases/latest/download/' --base-url 'https://app.telosplatforms.com/v1' --sync-memories)
```

Setup asks which harness to connect, then whether to share context with Codex, Claude Code, both, or neither. Selected context clients keep their existing model logins. Missing harnesses are installed before authorization. Each client authorizes its own connection. Run setup once, then launch your harness normally (`hermes`, `pi`, `opencode`, or `openclaw chat`, for example). Restart Codex or Claude Code after setup and review native hooks when prompted.

When uv is already installed, the equivalent direct command is:

```sh
uv run --python-preference only-managed --python 3.14 --script https://github.com/telosplatforms1/telos-partner-starter/releases/latest/download/telos-harness.py --base-url https://app.telosplatforms.com/v1 --skills-url https://github.com/telosplatforms1/telos-partner-starter/releases/latest/download/telos-skills.zip --sync-memories
```

Use an explicit harness argument before the options for noninteractive setup. `--subscription` keeps a Codex or Claude Code model login and connects automatic read-only recall plus curated memory sync. Optional connected-account reads, delegated actions and explicit context imports require their respective grants; use your connection page to select them. Installing skills alone grants no access.

Memory sync runs independently through its background service when enabled. Harness Memories enables curated-file sync; Telos Memories or memory off pauses it. Subscription recall requires the target API’s memory-read scope and recall endpoint (available in current production). Locally hosted or older deployments must provide the same API contract. Keep profile-directory overrides set when configuring and starting a named profile.

### Refresh skills before a session

The managed launch command refreshes both skills without repeating consent or changing providers:

```sh
uv run --python-preference only-managed --python 3.14 --script https://github.com/telosplatforms1/telos-partner-starter/releases/latest/download/telos-harness.py launch pi --skills-url https://github.com/telosplatforms1/telos-partner-starter/releases/latest/download/telos-skills.zip
```

Replace `pi` with your harness. Pass native arguments after `--`. Bare harness commands use installed skills without refreshing. Locally edited skills are preserved; download or validation errors stop managed launch. Use a versioned release URL to stay pinned.

The app skill recommends enabled routers first: **Orbit** for balanced use, **Zenith** for quality, **Warp** for speed, and **Slingshot** for cost. It discovers workspace availability and exact IDs, preserves explicit model choices, and confirms fixed-model-to-router migrations.

## Requirements and limits

- App integrations require the target deployment's documented API access and privately configured server credentials where applicable. Managed social login and context OAuth need approved partner registration. Missing access is reported as a setup dependency.
- The React UI kit is a separate artifact, described in the app skill's UI reference. Installing these skills does not install that package or a backend.
- Use the harness setup command generated by your Telos environment. Environments whose command includes `--skills-url` install both skills as part of setup; the command above also installs them independently.
- Codex supports Telos inference or keeping its existing inference provider with context-only setup. Aider's verified integration supports inference and reference material; it has no supported native Agent Skills or MCP loader.
- Optional curated memory sync requires Node.js 22+, supported profile files, and OS secure storage (Keychain, Linux Secret Service, or Windows DPAPI). Pi and OpenCode need a supported memory extension/export. Each harness keeps its own tools, history, and native memory.
- Capabilities depend on the target environment's [public API contract](https://app.telosplatforms.com/api/public/openapi.json), enabled permissions, and actual installed harness version. The skills distinguish configuration, mocked checks, and live verification.

MIT licensed. The license covers these skill files, not Telos services, UI-kit artifacts, trademarks, or third-party dependencies.

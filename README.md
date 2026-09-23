# Build with Telos

An Agent Skill for building apps with Telos authentication, ChatKit, connected context, the Telos UI kit, and supported partner APIs. It guides your coding assistant inside your project. This repository's initial release contains a skill, not a starter application or backend.

## Install

From your project, with Node.js/npm available:

```sh
npx skills add telosplatforms1/telos-partner-starter --skill build-with-telos
```

Select your assistant in the installer's prompts. For a local checkout:

```sh
npx skills add ./telos-partner-starter --skill build-with-telos
```

Alternatively, copy the entire `skills/build-with-telos` directory from this repository into your assistant's documented skill directory. For a project-scoped Codex installation, use `.agents/skills/build-with-telos`; for Claude Code, use `.claude/skills/build-with-telos`. Keep the `references`, `agents`, and license files together. Other assistants must support the [Agent Skills format](https://agentskills.io/specification); consult their installation instructions.

## Use

Ask your assistant:

> Use build-with-telos to create a chat app with Telos-managed login and the Telos UI kit.

> Use build-with-telos to add Telos chat to this existing app. Keep its framework and authentication.

> Use build-with-telos to connect my users' Telos accounts, search their context, and let them explicitly select snippets to use in chat.

In Codex you can invoke `$build-with-telos` directly. The skill can also be selected automatically when the assistant supports that behavior.

For authentication setup, the assistant asks you to choose **Telos-managed authentication end to end** or **your own authentication followed by Telos context integration**. It honors an explicit choice already made, records it in the project's guidance, and implements the selected path. Managed login and consent to access an existing Telos account's context remain separate.

When you first use it to set up or integrate a Telos app, the assistant adds a short reminder to the project's `AGENTS.md` or `CLAUDE.md` to use Telos skills for future AI application programming. Existing instructions are preserved and repeated use does not duplicate the reminder. This happens during app work, not as an installation hook.

## What you need

- A coding assistant with skill support and access to your project and public documentation.
- For managed auth, ChatKit, or other workspace APIs: a Telos developer account/workspace and a server-side API key with the needed scopes. Context-only OAuth integration does not require that key. Configure secrets privately, not in prompts or frontend environment variables.
- Server routes/functions in your chosen backend language for authentication, user mapping, secret-bearing requests, and streaming. No dependency on Telos's backend language or database is required.
- Telos UI uses the neutral `@telosplatforms/ai-kit@0.2.0` archive from the [kit 0.2.0 release](https://github.com/telosplatforms1/telos-partner-starter/releases/tag/ai-kit-v0.2.0). Its [archive](https://github.com/telosplatforms1/telos-partner-starter/releases/download/ai-kit-v0.2.0/telosplatforms-ai-kit-0.2.0.tgz) and [SHA256SUMS](https://github.com/telosplatforms1/telos-partner-starter/releases/download/ai-kit-v0.2.0/SHA256SUMS) are public downloads; the skill verifies the checksum before installing it. The kit contains the maintained neutral component catalog and theme template. Installing the skill alone does not install the package.
- For Connect Telos, manually approved partner OAuth credentials, a registered callback, and an enabled Context API deployment. Ordinary ChatKit integration does not require this optional pilot.

Capabilities depend on the deployment's [public API contract](https://app.telosplatforms.com/api/public/openapi.json). The skill identifies missing access/unsupported features and distinguishes mocked checks from authenticated results. V1 uses ChatKit; it does not promise a separate raw-inference API.

MIT licensed. The license covers the skill files, not Telos's service, UI-kit artifacts, trademarks, or third-party dependencies.

# Migrate existing chat to Telos

Use this path when the project already works and calls OpenAI, Anthropic, or OpenRouter for chat. The goal is to move those calls onto Telos with the smallest change that preserves behavior. It does not need the theme or chat-page onboarding, and it asks the authentication question only for call sites that move to the Assistant API.

Fetch the target [public schema](partner-apis.md#read-authoritative-contracts) first and confirm `POST /v1/chat/completions`, `POST /v1/messages`, and `GET /v1/models` exist in it. Treat a missing operation as a gap to report, not something to emulate.

## 1. Inventory call sites

Search server and client code, config, and environment files for every place a chat model is called:

- Provider SDKs (`openai`, `anthropic`, `@anthropic-ai/sdk`, OpenRouter through the OpenAI SDK or its HTTPS endpoint), raw HTTP to provider hosts, and framework wrappers that accept a base URL (Vercel AI SDK, LangChain, LiteLLM).
- Provider keys and base-URL settings in env files, deployment config, and secret stores.
- Calls made from the browser. These must move behind the app's server before migration; never ship a Telos key to the client.

Record each site: file, SDK or protocol, model id, and which features it uses (streaming, tools, images, structured output, embeddings, audio, Responses or Assistants APIs, `n` above 1, provider-specific options).

## 2. Choose a path per call site

| Call site | Path |
|---|---|
| The app owns the loop, prompts, tools, and history; request features are supported by the deployed contract and selected model | **Inference API (drop-in).** OpenAI/OpenRouter client: base URL `$TELOS_API_URL/v1`. Anthropic client: base URL `$TELOS_API_URL`. Key: Telos developer key with `inference:write`. Model: an authenticated binding/router id. Check image inputs, structured output and provider extensions against the current contract rather than a fixed feature list |
| A user-facing chat that needs Telos sessions, transcripts, uploads, connected context, action approvals, or per-user mapping | **Assistant API.** Follow [Assistant API and context](chat-and-context.md) after [Authentication](authentication.md) |
| Image or video generation | **Inference API jobs.** `POST /v1/jobs` with a provider binding ID and an operation listed in `GET /v1/catalog`; asynchronous, so the call site must poll |
| An operation or feature absent from the deployed contract, unavailable for the selected model, or lacking a faithful protocol mapping | **Stay on the current provider** and report the specific gap. Do not approximate it or reject supported structured output merely because an older Telos release lacked it |

Show the user the inventory with the proposed path per site and wait for confirmation. Honor a path already chosen in the project or conversation. When a site fits both, prefer the Inference API unless the user wants Telos-managed sessions or per-user mapping.

## 3. Map models

Read `GET /v1/models` with the Telos key: ids are exact provider binding ids (a Telos name differs from OpenAI and OpenRouter model names), plus `route:<set_id>` for each company routing set, which lets Telos pick the model per request and reports it in `X-Telos-Model`. Check the catalog's capabilities and `limits` through `GET /v1/catalog` when a site needs tools or a large output budget. Propose a mapping from each current model id to a binding id, ask the user to confirm it, and never substitute silently. Put the confirmed id in configuration the app already uses for models instead of repeating it at call sites.

## 4. Credentials and identity

Create or reuse one developer key with `inference:write` (add `assistant:*` scopes only for Assistant API sites). Follow the [credential preflight](authentication.md#developer-key-and-user-mapping): the key stays in the server's secret configuration, never in `VITE_*`, `NEXT_PUBLIC_*`, browser storage, logs, or committed examples, and is never requested in chat.

Drop-in calls run as the key owner's workspace. Pass an opaque stable end-user id (never an email) in `user` (OpenAI protocol) or `metadata.user_id` (Anthropic protocol) for attribution and prompt-cache scoping only. It does not select a Telos user, so do not present it as per-user isolation.

## 5. Cut over

- Change the base URL, key variable, and model for each confirmed site. Keep request code otherwise unchanged.
- Preserve native request fields and provider extensions supported by the deployed protocol. Do not impose a generic temperature bound, silently rescale values, or preemptively remove provider fields. Use typed validation/capability errors and the selected model's documented constraints; changes that affect behavior require the user's agreement or leave that site on its provider.
- Verify output-budget behavior against the deployed schema and selected model's limits rather than inventing a universal default.
- Do not add automatic fallback to the old provider when Telos fails, and do not keep both clients behind a flag. Delete the old client configuration only for migrated sites, and remove old provider keys from the environment only after verification and with the user's agreement.
- Handle Telos errors as the protocol's error envelope with typed `code` values: `402` credits or billing, `429` limits (respect `Retry-After`), `400`/`422` unsupported or invalid requests, `503` provider unavailable. Do not retry a failed streaming turn that already produced output.

## 6. Streaming and tools

- OpenAI protocol streams end with `data: [DONE]`, report usage only when `stream_options.include_usage` is set, and send a failure after streaming starts as one `data:` error frame without `[DONE]`. Anthropic streams use the Messages event lifecycle with a terminal `error` event.
- Tools stay client-owned. Telos returns `tool_calls` or `tool_use`; the app runs them and sends the results back. Telos does not execute tools or repair arguments.

## 7. Verify

Run the project's own build and tests. With the authorized key, for each migrated site check a normal call, a streamed call to completion, a tool round trip if it uses tools, and a rejected unsupported field. Check one error path (bad key or missing scope) surfaces through the app's existing error handling, and that the browser bundle contains no Telos key. Without credentials, test against the schema and label mocks as mocks. Report which sites moved, which stayed and why, and which checks were live or mocked.

## 8. Record in project instructions

Add the section from [SKILL.md](../SKILL.md#keep-telos-guidance-in-the-project) if it is missing, plus: each migrated site and path, the confirmed model mapping, the config file that holds the model ids and base URLs, and sites that stayed on a provider with the reason. Never record credentials.

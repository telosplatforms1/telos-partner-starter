# Migrate existing chat to Telos

Use this path for existing apps and unfinished scaffolds that use OpenAI, Anthropic, OpenRouter, or another client implementing a supported protocol. Migrate the app with the smallest change that preserves its behavior. Keep its framework, login, UI, prompts, tools, history and deployment layout. The coding harness's inference provider is a separate setting; migrating an app does not authorize changing it.

Start by finding the existing client factory and server configuration. Reuse their base URL, credential and model settings instead of adding an SDK, adapter, provider registry or parallel chat implementation. If a scaffold has only placeholders, wire that intended path to Telos and complete only the missing pieces needed for the requested feature. Keep an existing backend or serverless route; add a server boundary only if secret-bearing calls currently run in the browser or none exists.

Fetch the target [public schema](partner-apis.md#read-authoritative-contracts) and confirm `GET /v1/models` plus the protocol endpoint needed by each site (`POST /v1/chat/completions` or `POST /v1/messages`). An unused protocol is not a prerequisite. Treat a missing required operation as a gap to report, not something to emulate.

## 1. Inventory call sites

Search server and client code, config, and environment files for every place a chat model is called:

- Provider SDKs (`openai`, `anthropic`, `@anthropic-ai/sdk`, OpenRouter through the OpenAI SDK or its HTTPS endpoint), raw HTTP to provider hosts, and framework wrappers that accept a base URL (Vercel AI SDK, LangChain, LiteLLM).
- Provider keys and base-URL settings in env files, deployment config, and secret stores.
- Calls made from the browser. These must move behind the app's server before migration; never ship a Telos key to the client.

Record each site: file, shared client/config location, SDK or protocol, model id (including placeholders), and features used (streaming, tools, images, structured output, embeddings, audio, Responses or Assistants APIs, `n` above 1, provider-specific options). Inspect secret presence without printing values. Gather the existing run/build commands so the migrated scaffold can be started and verified.

## 2. Choose a path per call site

| Call site | Path |
|---|---|
| The app owns the loop, prompts, tools, and history; request features are supported by the deployed contract and selected model | **Inference API (drop-in).** OpenAI/OpenRouter client: base URL `$TELOS_API_URL/v1`. Anthropic client: base URL `$TELOS_API_URL`. Key: Telos developer key with `inference:write`. Model: an authenticated binding/router id. Check image inputs, structured output and provider extensions against the current contract rather than a fixed feature list |
| A user-facing chat that needs Telos sessions, transcripts, uploads, connected context, action approvals, or per-user mapping | **Assistant API.** Follow [Assistant API and context](chat-and-context.md) after [Authentication](authentication.md) |
| Image or video generation | **Inference API jobs.** `POST /v1/jobs` with a provider binding ID and an operation listed in `GET /v1/catalog`; asynchronous, so the call site must poll |
| An operation or feature absent from the deployed contract, unavailable for the selected model, or lacking a faithful protocol mapping | **Stay on the current provider** and report the specific gap. Do not approximate it or reject supported structured output merely because an older Telos release lacked it |

When a site fits both, use the Inference API unless the user wants Telos-managed sessions or per-user mapping. An instruction to migrate existing supported calls authorizes that path; do not ask separately to preserve the app or use its existing SDK. No theme, auth-provider, or context-consent onboarding is needed for an inference-only migration unless the user requests their own Telos global context and memory through OAuth. Ask about authentication only where requested Assistant API features require an unresolved choice.

## 3. Prefer a router and map call sites

Follow the shared [router and model selection guidance](chat-and-context.md#choose-a-routing-set). Read `GET /v1/models` with the Telos key and recommend an enabled router first: normally Orbit for balanced app work, or the enabled policy matching the user's priority. Use its exact discovered `route:<set_id>` as the existing SDK request's `model`; OpenRouter's previous model name or auto-routing setting is not a Telos router ID. Keep the current SDK and loop. Use an exact provider binding when the user explicitly wants a fixed model, or agrees to it after a router setup gap is explained. Check `GET /v1/catalog` and the deployed routing contract for required capabilities and limits.

Present call-site paths, proposed router/model mappings, why the router fits, and any behavior-changing gaps in one concise review. Wait for unresolved choices, including approval to replace a fixed model with routing; preserve already confirmed choices. An explicitly retained exact model ID verified in discovery needs no replacement choice. Never silently substitute a model or router. Put confirmed IDs in the app's existing server-side model configuration instead of repeating them at call sites, and check `X-Telos-Model` to identify the concrete answering model on live inference calls.

## 4. Credentials and identity

For a shared workspace integration, reuse a configured Telos developer key with `inference:write`, or guide the developer through private setup when it is missing (add `assistant:*` scopes only for Assistant API sites). For requested per-person global context, follow registered-app OAuth instead of provisioning a shared key. For the workspace-key path, follow the [credential preflight](authentication.md#developer-key-and-user-mapping), including the key link, exact server configuration destination and runtime presence check. The key stays in server secrets, never in `VITE_*`, `NEXT_PUBLIC_*`, browser storage, logs, or committed examples, and is never requested in chat. A coding harness's configured credential does not establish authorization to copy it into the app. Continue independent implementation while credentials or model choices are pending.

For an ordinary workspace key, drop-in calls run as the key owner. If each app user needs their own existing Telos context and memory, use [registered-app OAuth](authentication.md#connect-with-telos-registered-app-oauth) and select that user’s stored token on the backend; a shared developer key cannot provide that identity. Pass an opaque stable end-user id (never an email) in `user` (OpenAI protocol) or `metadata.user_id` (Anthropic protocol) for attribution and prompt-cache scoping only. It does not select a Telos user, so do not present it as per-user isolation.

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

Run the project's own build and relevant tests, then refresh the affected local runtime and exercise the existing app flow. With the authorized key, for each migrated site check a normal call, a streamed call to completion, a tool round trip if it uses tools, and a rejected unsupported field. Verify the returned model/routing metadata where documented. Check one error path (bad key or missing scope) surfaces through existing error handling, and that the browser bundle contains no Telos key. Without credentials, test against the schema and label mocks as mocks. Finish with the exact start command, private configuration destination and any remaining setup, plus which sites moved, which stayed and why, and which checks were live or mocked. Do not describe a scaffold with missing credentials as a working live integration.

## 8. Record in project instructions

Add the section from [SKILL.md](../SKILL.md#keep-telos-guidance-in-the-project) if it is missing, plus: each migrated site and path, the confirmed model mapping, the config file that holds the model ids and base URLs, and sites that stayed on a provider with the reason. Never record credentials.

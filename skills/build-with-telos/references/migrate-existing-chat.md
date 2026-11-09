# Migrate existing chat to Telos

Use this path for existing apps and unfinished scaffolds that use OpenAI, Anthropic, OpenRouter, or another client implementing a supported protocol. Migrate the app with the smallest change that preserves its behavior. Keep its framework, login, UI, prompts, tools, history and deployment layout. The coding harness's inference provider is a separate setting; migrating an app does not authorize changing it.

Start by finding the existing client factory and server configuration. Reuse their base URL, credential and model settings instead of adding an SDK, adapter, provider registry or parallel chat implementation. If a scaffold has only placeholders, wire that intended path to Telos and complete only the missing pieces needed for the requested feature. Keep an existing backend or serverless route; add a server boundary only if secret-bearing calls currently run in the browser or none exists.

Fetch the target [public schema](partner-apis.md#read-authoritative-contracts) and confirm `GET /v1/models` plus the protocol endpoint used by each site: `POST /v1/chat/completions`, `POST /v1/responses`, or `POST /v1/messages`. An unused protocol is not a prerequisite. Treat a missing required operation as a gap to report, not something to emulate.

## 1. Inventory call sites

Search server and client code, config, and environment files for every place a chat model is called:

- Provider SDKs (`openai`, `anthropic`, `@anthropic-ai/sdk`, OpenRouter through the OpenAI SDK or its HTTPS endpoint), raw HTTP to provider hosts, and framework wrappers that accept a base URL (Vercel AI SDK, LangChain, LiteLLM).
- Provider keys and base-URL settings in env files, deployment config, and secret stores.
- Calls made from the browser. These must move behind the app's server before migration; never ship a Telos key to the client.

Record each site: file, shared client/config location, SDK or protocol, model id (including placeholders), and features used (streaming, tools, images, structured output, embeddings, audio, Responses or Assistants APIs, `n` above 1, provider-specific options). Inspect secret presence without printing values. Gather the existing run/build commands so the migrated scaffold can be started and verified.

## 2. Choose a path per call site

| Call site | Path |
|---|---|
| The app owns the loop, prompts, tools, and history; request features are supported by the deployed contract and selected model | **Inference API.** Keep the existing Chat Completions, Responses or Messages client. OpenAI/OpenRouter base URL: `$TELOS_API_URL/v1`; Anthropic: `$TELOS_API_URL`. Use a key with `inference:write` and an exact public model/router ID from authenticated discovery. Check required features and stateful behavior before calling the change drop-in |
| A user-facing chat that needs Telos sessions, transcripts, uploads, connected context, action approvals, or per-user mapping | **Assistant API.** Follow [Assistant API and context](chat-and-context.md) after [Authentication](authentication.md) |
| Image or video generation | **Inference API jobs.** Discover a provider binding in `GET /v1/catalog`, then its operation/input schema through `GET /v1/jobs/operations?model=<binding_id>`. Upload inputs through `POST /v1/uploads`; submit `POST /v1/jobs` with the required `Idempotency-Key` and poll its `status_url`. Keep documented user selectors consistent on uploads, jobs, polling and downloads |
| An operation or feature absent from the deployed contract, unavailable for the selected model, or lacking a faithful protocol mapping | **Stay on the current provider** and report the specific gap. Do not approximate it or reject supported structured output merely because an older Telos release lacked it |

When a site fits both, use the Inference API unless the user wants Telos-managed sessions or per-user mapping. An instruction to migrate existing supported calls authorizes that path; do not ask separately to preserve the app or use its existing SDK. No theme, auth-provider, or context-consent onboarding is needed for an inference-only migration unless the user requests their own Telos global context and memory through OAuth. Ask about authentication only where requested Assistant API features require an unresolved choice.

## 3. Prefer a router and map call sites

Follow the shared [router and model selection guidance](chat-and-context.md#choose-a-routing-set). Read `GET /v1/models` with the Telos key and recommend an enabled router first: normally Orbit for balanced app work, or the enabled policy matching the user's priority. Use its exact discovered `route:<set_id>` as request `model`; OpenRouter's previous model name or auto-routing setting is not a Telos router ID. For an explicit fixed model, use its exact readable public ID from discovery. Internal `mdl_*` IDs and provider binding IDs are rejected for model turns. Telos selects an eligible provider of that model and can fail over within the same model; choosing a fixed model does not pin a provider. Media jobs use their separate provider binding contract. Check the catalog and deployed contract for required capabilities and limits.

Present call-site paths, proposed router/model mappings, why the router fits, and any behavior-changing gaps in one concise review. Wait for unresolved choices, including approval to replace a fixed model with routing; preserve already confirmed choices. An explicitly retained exact model ID verified in discovery needs no replacement choice. Never silently substitute a model or router. Put confirmed IDs in the app's existing server-side model configuration instead of repeating them at call sites, and check `X-Telos-Model` to identify the concrete answering model on live inference calls.

Reasoning controls follow the chosen protocol: Chat Completions uses `reasoning_effort`, Responses uses `reasoning.effort`, and Messages uses its documented thinking/effort fields. Discover supported named levels and integer ranges for the selected model; a syntactically accepted preference may be substituted or omitted. Verify the effective effort header rather than assuming every model supports every level or integer budget.

## 4. Credentials and identity

For a shared workspace integration, reuse a configured Telos developer key with `inference:write`, or guide the developer through private setup when it is missing (add `assistant:*` scopes only for Assistant API sites). For requested per-person global context, follow registered-app OAuth instead of provisioning a shared key. For the workspace-key path, follow the [credential preflight](authentication.md#developer-key-and-user-mapping), including the key link, exact server configuration destination and runtime presence check. The key stays in server secrets, never in `VITE_*`, `NEXT_PUBLIC_*`, browser storage, logs, or committed examples, and is never requested in chat. A coding harness's configured credential does not establish authorization to copy it into the app. Continue independent implementation while credentials or model choices are pending.

For an ordinary workspace key, drop-in calls run as the key owner. If each app user needs their own existing Telos context and memory, use [registered-app OAuth](authentication.md#connect-with-telos-registered-app-oauth) and select that user’s stored token on the backend; a shared developer key cannot provide that identity. Pass an opaque stable end-user id (never an email) in `user` (OpenAI protocol) or `metadata.user_id` (Anthropic protocol) for attribution and prompt-cache scoping only. It does not select a Telos user, so do not present it as per-user isolation.

## 5. Cut over

- Change the base URL, key variable, and model for each confirmed site. Keep request code otherwise unchanged.
- Preserve native request fields and provider extensions supported by the deployed protocol. Do not impose a generic temperature bound, silently rescale values, or preemptively remove provider fields. Use typed validation/capability errors and the selected model's documented constraints; changes that affect behavior require the user's agreement or leave that site on its provider.
- Inspect `X-Telos-Omitted-Parameters` and `X-Telos-Omitted-Tools`: unsupported advisory preferences and optional tool kinds can be omitted while the call succeeds. Tool names in the latter are percent-encoded; split the comma-separated entries before decoding. Surface material omissions instead of claiming full feature parity. Required tool choices, output formats, conversation and security contracts remain strict and fail with typed errors when untranslatable. Verify `X-Telos-Model`, `X-Telos-Routing-Decision-Id` and, when present, `X-Telos-Reasoning-Effort` against the requested choice.
- Verify output-budget behavior against the deployed schema and selected model's limits rather than inventing a universal default.
- Do not add automatic fallback to the old provider when Telos fails, and do not keep both clients behind a flag. Delete the old client configuration only for migrated sites, and remove old provider keys from the environment only after verification and with the user's agreement.
- Handle Telos errors as the protocol's error envelope with typed `code` values: `402` credits or billing, `429` limits (respect `Retry-After`), `400`/`422` unsupported or invalid requests, `503` provider unavailable. Do not retry a failed streaming turn that already produced output.

## 6. Streaming and tools

Keep the existing SDK's parser for its actual protocol; network chunks are not complete events. Check HTTP status/content type first and handle errors after HTTP 200. EOF without the protocol's terminal event is interruption.

| Protocol | Streaming contract |
|---|---|
| Chat Completions | `data:` chunks end with `[DONE]`; usage requires `stream_options.include_usage`. Failure after output is a `data:` error frame without `[DONE]`. |
| Responses | Named `response.*` events, including text, reasoning-summary and function-call argument deltas. Terminate on `response.completed`, `response.incomplete` or `response.failed`; only completed is success. Read final status, usage and incomplete/error details. No `[DONE]`; `stream_options` is accepted but ignored. A stream stall after output yields `response.failed` with `provider_stream_stalled`. |
| Anthropic Messages | Messages lifecycle events end with `message_stop`, or a terminal `error` event on failure. |

Responses are not stored: `store=true`, `previous_response_id` and `conversation` are refused. Resend history, function-call items and matching `function_call_output` items each turn; do not use a returned response ID as a continuation handle. Chat Completions also rejects `store=true`. Storage flags do not control Telos memory; that is a separate key/consent setting.

Tools stay client-owned. Telos returns Chat Completions `tool_calls`, Messages `tool_use`, or Responses `function_call` items; the app validates and executes them, then replays matching results. Responses preserves namespaced function identities and supports client-executed tool search when documented by the deployment. Its hosted tools such as web search and image generation, and freeform tools, are omitted and reported; a required unsupported tool fails. Messages preserves native tool/result types only on compatible bindings; otherwise it returns typed errors. Do not assume a declared tool was offered or executed. Telos does not execute tools or repair arguments.

## 7. Verify

Run the project's own build and relevant tests, then refresh the affected local runtime and exercise the existing app flow. With the authorized key, for each migrated protocol check a normal call, stream completion and failure, a tool round trip if used, and a rejected required unsupported feature. Check omission headers and actual model/effort; for Responses also verify history replay and incomplete results. Check one auth error reaches existing error handling and the browser bundle contains no Telos key. Without credentials, validate against schemas and label mocks. Finish with the exact start command, private configuration destination, remaining setup, migrated/retained sites and live versus mocked checks. Missing credentials do not constitute a working live integration.

## 8. Record in project instructions

Add the section from [SKILL.md](../SKILL.md#keep-telos-guidance-in-the-project) if it is missing, plus: each migrated site and path, the confirmed model mapping, the config file that holds the model ids and base URLs, and sites that stayed on a provider with the reason. Never record credentials.

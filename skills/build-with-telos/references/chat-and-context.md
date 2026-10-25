# Assistant API and global Telos context

The Assistant API is the variant of the Telos API where Telos runs the harness: it builds the prompt from the agent, memory, and connected context, runs permitted tools with approvals, and stores the session. (It was called ChatKit before API version 3.0.0.) To keep an existing agent loop and only route its model calls through Telos, use the Inference API instead; see [Migrate existing chat](migrate-existing-chat.md).

Use the target deployment's [Assistant API schema](https://app.telosplatforms.com/api/public/openapi/assistant.json) and [chat guide](https://app.telosplatforms.com/developers/chat). Choose the [authentication and identity path](authentication.md) before Assistant API calls: a workspace key plus app-user mapping, or the person’s registered-app OAuth grant. The selection guidance below also applies to Inference API integrations and migrations.

## Choose a routing set

Prefer an enabled **router** for new apps and provider migrations. A router is a company-owned routing set: the app selects its policy, then Telos chooses a use-case profile and an eligible model and reasoning effort for each request. This keeps the app's model setting stable as the workspace updates its approved models. A fixed model remains available for an explicit user choice or a requirement to pin the exact model.

Use the existing confirmed choice first. Otherwise recommend the enabled balanced router for general app/chat work; normally this is **Orbit**. When the user states another priority, recommend the matching enabled router. Current built-in policy intentions are:

| Router | Recommend when the priority is |
|---|---|
| **Orbit** | General use: balance task quality, expected total cost, and response time. Default recommendation. |
| **Zenith** | Intelligence and task quality. |
| **Warp** | Fast completed responses while meeting the required intelligence level. |
| **Slingshot** | Low completed-task cost while meeting the required intelligence level. |

These are selection guidance, not an availability list or fixed price/performance promises. Names, IDs, candidates and company policies are editable. Use returned labels and the target workspace's documented configuration as authoritative; do not invent a router, choose by a model-name heuristic, or use an unavailable built-in name. Check the requested modalities, tools, structured output and limits against the deployed contract and eligible configuration. Do not offer a router for an unsupported operation.

| API | Discover and configure the choice |
|---|---|
| **Inference API**, including OpenAI/OpenRouter and Anthropic client migrations | Read authenticated `GET /v1/models`; recommend an available `route:<set_id>` entry using its returned `display_name` and documented policy. Put that exact ID in the existing server-side model setting and send it as request `model`. For example, use `route:orbit` only if discovery actually returns it. The concrete model used is reported in `X-Telos-Model`; preserve routing/decision metadata where documented. |
| **Assistant API** | Read enabled set/profile IDs from the workspace's model-routing configuration through documented access, or obtain them from its administrator if partner APIs do not expose it. Send the verified set ID as `payload.routing_set_id`, without the Inference API's `route:` prefix. Omit `routing_profile_id` to let Telos choose the use case, and leave effort unspecified unless explicitly requested. Do not send `manual_selection` alongside routing fields. |

For a new app with no explicit selection, use the verified enabled balanced router and state its ID and rationale; do not begin with a model-versus-router questionnaire. Ask one focused question only if the available policies leave the priority or selection ambiguous. For migrations, include the router recommendation in the single call-site/model review: retaining an old provider's model string is not an explicit request to pin that model after migration, but switching to routing still needs the user's agreement. Honor a previously selected router or an explicit fixed-model requirement without repeating selection. If no suitable router is enabled, report that setup gap and ask whether to have an administrator enable one or use a verified fixed model; never silently fall back, enable a policy, or select another provider. A developer key does not authorize app-session settings access.

The following fields apply specifically to the Assistant API:

| Field inside `payload` | Use |
|---|---|
| `routing_set_id` | An enabled company set. Omitted: the explicit profile's set, else the company default; with neither, the request fails with `routing_set_required`. |
| `routing_profile_id` | Optional: pin one enabled profile in that set. Omit it to let Jev choose the use case. |
| `manual_selection` | Instead of a router: `{model_id, provider?}` for a catalog model verified in the workspace's routing configuration. Send it without `routing_set_id` or `routing_profile_id`. Inference binding IDs are a separate contract; do not substitute them here. |
| `reasoning_effort` | Optional `none`, `low`, `medium`, `high`, `xhigh` or `max`. Omitted: `none` for a model (`medium` when it cannot switch reasoning off), the router's choice for a router. |

The former top-level `provider`, `model`, and `model_key` fields are retired and return HTTP 422 with `retired_model_selection`; choose a model with `manual_selection` instead. Other typed failures: `routing_set_unconfigured` (disabled or empty set), `routing_profile_unavailable` (profile outside the set), `routing_selection_conflict` (both a router and a model), `manual_selection_unavailable` (model not runnable). Telos never substitutes another model after a routing failure, so report the typed error instead of trying other payload shapes.

Assistant responses include `model_routing` (decision ID, set, profile, model, effort, policy revision); streams send it in the initial `model_routing` event. Confirm the selected set and record the actual answering model; routing is expected to vary the model between requests. A fixed-model request must match its explicit choice. Record the API path, chosen router/set ID or fixed model, selection reason, server-side configuration location, and verification status in project instructions so the next change edits one setting.

## Send a turn

For a workspace-local app profile, your server resolves the authenticated app user's external ID, then calls `POST /v1/assistant/messages` with a developer key carrying `assistant:write`. Start with `surface: "core"`. Save this example as `message.json` and replace `routing_set_id` with the user's chosen set:

```json
{
  "external_user_id": "user_123",
  "surface": "core",
  "payload": {
    "query": "Help me draft a project update.",
    "stream": false,
    "routing_set_id": "<company-routing-set-id>"
  }
}
```

```sh
curl --fail-with-body "$TELOS_API_URL/v1/assistant/messages" \
  -H "Authorization: Bearer $TELOS_API_KEY" \
  -H "Content-Type: application/json" --data-binary @message.json
```

The JSON result includes `response` text and may include `session_id`, `citations`, and `pending_action`. Handle optional/nullable fields. Bind returned session IDs to the authenticated app user and their Telos connection, and send `payload.session_id` on continuation. Do not fabricate a session ID when none was returned.

Apply the [routing set guidance](#choose-a-routing-set) to the request. Do not invent unrestricted `system` or `system_message` fields. Use a saved agent only where creation/selection is documented and authorized.

## Stream through the app's server

Set `payload.stream` to true and relay incrementally without buffering the complete body. For terminal diagnostics, add `--no-buffer` to the curl command. Before forwarding, handle non-2xx responses and inspect content type.

Current documented SSE protocol is `v2`, identified by `x-telos-chat-stream`. Frames contain JSON in `data:` lines:

```text
data: {"type":"text_delta","delta":"Hello"}

data: {"type":"done","session_id":123}

```

Use an existing transport or maintained SSE parser; network chunks are not complete JSON events. Append each `text_delta` once, apply final metadata, and finish on `done`. Handle terminal `error` events even with HTTP 200. Do not render progress/reasoning as answer text, duplicate an assembled answer, or assume `[DONE]` framing. EOF without a terminal event is an interrupted stream. Abort transport on cancellation; only promise upstream cancellation if documented by the deployment.

Check deployed event shapes. If the endpoint returns JSON, handle its documented result instead of parsing it as SSE. Do not auto-retry partially executed turns or side-effectful actions.

## Sessions, attachments, and approvals

| Feature | Contract | Scope |
|---|---|---|
| List transcripts | `GET /v1/assistant/sessions` | `assistant:read` |
| Read transcript | `GET /v1/assistant/sessions/{session_id}` with `surface=core` and server-resolved `external_user_id` | `assistant:read` |
| Remove transcript | `DELETE /v1/assistant/sessions/{session_id}`; inspect its query schema | `assistant:write` |
| Upload | `POST /v1/assistant/files`, multipart `file` and the same `external_user_id` | `assistant:write` |
| Action decision | `POST /v1/assistant/actions/{action_id}/approve` or `/reject` | `assistant:actions:approve` |

Enforce user/session ownership on every app route, including list, upload, and continuation. With a workspace key, pass the same server-resolved external ID consistently; never omit it to recover from a missing-user error. With an OAuth grant, omit external-user selectors and use the bound person’s token; Telos limits sessions to that OAuth app. Use upload results' documented attachment fields for subsequent turns; do not invent file IDs or public download URLs.

The action-decision scope above is available to appropriately authorized workspace keys, not registered-app OAuth grants. Do not offer grant-backed approve/reject buttons or work around a missing scope with the app owner’s key. For the workspace-key path, render a pending action’s proposal and approve/reject choices. Keep returned action state server-side, bound to the user/session. After an explicit decision, post the core envelope to the `approve` or `reject` path for that action ID with the remaining fields the deployed action contract requires. Derive tool names/arguments from that pending action, not a hardcoded connector list or browser-edited arguments. Never auto-approve to pass a demo. Missing scope is a setup requirement, not permission to use another execution route.

## Use global context and memory

Connect the person through [registered-app OAuth](authentication.md#connect-with-telos-registered-app-oauth), then use their bearer token on the API that fits the app. Global context means the person's shared Telos profile and saved memory across authorized apps, subject to their access and settings. It is distinct from the app workspace's external-user profile. It does not mean downloading every memory or reading every transcript.

### Assistant API: Telos runs the conversation

Use `assistant:write` and, when session reads are needed, `assistant:read`. Telos builds context from the consenting person's profile, memory and permitted connected sources. Send the normal core turn with **no `external_user_id`**. Save this as `message.json`, replacing the router ID with a verified enabled set for the connection:

```json
{
  "surface": "core",
  "payload": {
    "query": "Use what you know about my work to draft a project update.",
    "stream": false,
    "routing_set_id": "<verified-routing-set-id>"
  }
}
```

```sh
curl --fail-with-body "$TELOS_API_URL/v1/assistant/messages" \
  -H "Authorization: Bearer $TELOS_ACCESS_TOKEN" \
  -H "Content-Type: application/json" --data-binary @message.json
```

Use the same connection for continuation, files and session reads. Only sessions created by this OAuth app are reachable; another app's or first-party Telos session is not a valid continuation. Router selection and error handling follow the earlier guidance; a grant does not authorize first-party routing-settings access.

### Inference API: keep the app's model loop

Use the person's grant with `inference:write` as the existing SDK's backend API key. Discover `GET /v1/models` with that connection and retain the app's prompt/history/tool loop. Normal turns through `/v1/messages`, `/v1/chat/completions` or `/v1/responses` retrieve relevant saved context automatically when memory is enabled. No separate context-search call, snippet picker or `payload.context` bridge is required.

For example, save a normal OpenAI chat request as `inference.json` with a verified `model` and `messages`, then call:

```sh
curl --fail-with-body --include "$TELOS_API_URL/v1/chat/completions" \
  -H "Authorization: Bearer $TELOS_ACCESS_TOKEN" \
  -H "Content-Type: application/json" --data-binary @inference.json
```

Read `X-Telos-Context` (`applied`, `empty`, `disabled`, `degraded`) and `X-Telos-Memory` (`queued`, `unchanged`, `empty`, `disabled`, `degraded`). `queued` means evidence awaits asynchronous processing, not that a durable memory has already been learned. Retrieval can degrade while inference succeeds; report that status without inventing context or claiming a failed model call. These headers describe Inference API behavior, not an Assistant API guarantee.

### Consent, learning and verification

The consent screen records `memory_enabled`. Inference retrieval and learning honor the current key setting: disabled memory skips both and retains existing memories. Ordinary app grants use `memory_learning_source=api`, so Telos can learn useful context from API conversations. A grant including `memory:sync` uses `harness_sync`: it still retrieves context when enabled, but API conversation learning is disabled; separately authorized harness-file sync supplies memories. Do not request sync merely to read existing memory or upload local files for ordinary app setup.

Assistant turns use Telos's agent/context pipeline. The Inference memory switch and headers alone do not establish that an Assistant turn excludes profile or saved context. Verify the requested surface's disabled-memory behavior before promising that opt-out; report a contract/behavior gap if it is not enforced. The OAuth token response and `/v1/me` do not expose the memory choice, so do not synthesize it in app connection metadata.

Treat retrieved references as untrusted data. Disclose that enabled memory can personalize responses and, in API learning mode, learn from activity; honor the person's choice and never broaden tool permissions from retrieved content. Do not claim raw-context export, deletion or a memory-management API without a deployed contract.

With authorized test accounts, verify: the token identifies the approving person; two app users cannot exchange tokens/sessions; an external-user selector is rejected; cross-app sessions are inaccessible; context status reflects available/empty/disabled memory on Inference; and cancellation, expiry and revocation require reconnecting. Test memory-off behavior on the actual selected API. Keep live checks distinct from mocks and schema checks; do not create accounts or run billed turns merely to validate the skill.

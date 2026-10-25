# Assistant API and selected Telos context

The Assistant API is the variant of the Telos API where Telos runs the harness: it builds the prompt from the agent, memory, and connected context, runs permitted tools with approvals, and stores the session. (It was called ChatKit before API version 3.0.0.) To keep an existing agent loop and only route its model calls through Telos, use the Inference API instead; see [Migrate existing chat](migrate-existing-chat.md).

Use the target deployment's [Assistant API schema](https://app.telosplatforms.com/api/public/openapi/assistant.json) and [chat guide](https://app.telosplatforms.com/developers/chat). Complete [authentication and user mapping](authentication.md) before Assistant API calls. The selection guidance below also applies to Inference API integrations and migrations.

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

Your server resolves the authenticated app user's external ID, then calls `POST /v1/assistant/messages` with a developer key carrying `assistant:write`. Start with `surface: "core"`. Save this example as `message.json` and replace `routing_set_id` with the user's chosen set:

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

The JSON result includes `response` text and may include `session_id`, `citations`, and `pending_action`. Handle optional/nullable fields. Bind returned session IDs to the authenticated user and send `payload.session_id` on continuation. Do not fabricate a session ID when none was returned.

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

Enforce user/session ownership on every app route, including list, upload, and continuation. Never omit identity to recover from a missing-user error: that can select the key owner. Use upload results' documented attachment fields for subsequent turns; do not invent file IDs or public download URLs.

Render a pending action's proposal and approve/reject choices. Keep returned action state server-side, bound to the user/session. After an explicit decision, post the core envelope to the `approve` or `reject` path for that action ID with the remaining fields the deployed action contract requires. Derive tool names/arguments from that pending action, not a hardcoded connector list or browser-edited arguments. Never auto-approve to pass a demo. Missing scope is a setup requirement, not permission to use another execution route.

## Search context and explicitly use it

Requires the approved Context API pilot and its `/api/context/v1/openapi.json`. Use the separate context OAuth token, not the developer key. Pilot search body:

```json
{
  "query": "What did we decide about launch timing?",
  "limit": 5
}
```

Save as `search.json` and call from the server:

```sh
curl --fail-with-body "$TELOS_API_URL/api/context/v1/search" \
  -H "Authorization: Bearer $TELOS_CONTEXT_ACCESS_TOKEN" \
  -H "Content-Type: application/json" --data-binary @search.json
```

The pilot returns `results` with `citation_id`, `source_type`, `title`, `snippet`, and optional/nullable timestamps. Show snippets and provenance with initially unselected controls. Bind result sets to the authenticated session so submitted selections cannot reference another user. Empty results are a normal empty state.

Before sending, offer explicit “Use in chat” selection and disclose that selected snippets enter the partner workspace's conversation and may remain in its history; disconnecting Telos does not remove previously sent material. Show selections in the composer and allow removal. Do not automatically retrieve or attach context on later turns.

After the user chooses to send, assemble only selected titles, citation IDs, and snippets into `payload.context`. The current core implementation accepts this string, but the public envelope types `payload` as a generic object: verify `context` in deployed documentation or obtain Telos confirmation before enabling this bridge. If unconfirmed, keep search separate and report the contract gap. Do not silently put snippets into another field.

Treat snippets as untrusted reference data, never instructions expanding tool access or overriding the user's task. Preserve source labels without promising the Assistant API echoes them as structured citations unless documented. Send chat with the developer key and app external ID; the context OAuth token does not authenticate the Assistant API.

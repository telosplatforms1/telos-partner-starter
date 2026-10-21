# Assistant API and selected Telos context

The Assistant API is the variant of the Telos API where Telos runs the harness: it builds the prompt from the agent, memory, and connected context, runs permitted tools with approvals, and stores the session. (It was called ChatKit before API version 3.0.0.) To keep an existing agent loop and only route its model calls through Telos, use the Inference API instead; see [Migrate existing chat](migrate-existing-chat.md).

Use the target deployment's [Assistant API schema](https://app.telosplatforms.com/api/public/openapi/assistant.json) and [chat guide](https://app.telosplatforms.com/developers/chat). Complete [authentication and user mapping](authentication.md) first.

## Choose a routing set

Telos chooses the model inside the company's routing policy. A company admin configures **routing sets** (for example `speed`, `cost`, or `absolute_best`) in Admin settings → Model routing; each set contains use-case **profiles** with approved models and reasoning efforts. A request selects a set; Jev then picks the profile for the task and an eligible model and effort within it. Alternatively, a request can choose one model directly with `manual_selection`, skipping routing.

Before configuring generation, resolve the user's routing set or explicit model choice unless already specified in the project or conversation. Read enabled set/profile and catalog model IDs from the workspace's model-routing configuration using its documented access mechanism. If the partner contract does not expose that configuration, obtain the verified IDs from the workspace administrator; do not use a developer key against an app-session settings endpoint. Names and IDs are editable, so never hardcode examples from these docs.

| Field inside `payload` | Use |
|---|---|
| `routing_set_id` | An enabled company set. Omitted: the explicit profile's set, else the company default; with neither, the request fails with `routing_set_required`. |
| `routing_profile_id` | Optional: pin one enabled profile in that set. Omit it to let Jev choose the use case. |
| `manual_selection` | Instead of a router: `{model_id, provider?}` for a catalog model verified in the workspace's routing configuration. Send it without `routing_set_id` or `routing_profile_id`. Inference binding IDs are a separate contract; do not substitute them here. |
| `reasoning_effort` | Optional `none`, `low`, `medium`, `high`, `xhigh` or `max`. Omitted: `none` for a model (`medium` when it cannot switch reasoning off), the router's choice for a router. |

The former top-level `provider`, `model`, and `model_key` fields are retired and return HTTP 422 with `retired_model_selection`; choose a model with `manual_selection` instead. Other typed failures: `routing_set_unconfigured` (disabled or empty set), `routing_profile_unavailable` (profile outside the set), `routing_selection_conflict` (both a router and a model), `manual_selection_unavailable` (model not runnable). Telos never substitutes another model after a routing failure, so report the typed error instead of trying other payload shapes.

Responses include `model_routing` (decision ID, set, profile, model, effort, policy revision); streams send it in the initial `model_routing` event. Use it to confirm which model answered. Record the chosen set, its server-side configuration location, and verification status in project instructions so the next change edits one setting.

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

# Authentication and identity

Read the target deployment's [auth schema](https://app.telosplatforms.com/api/public/openapi/auth.json) and [users schema](https://app.telosplatforms.com/api/public/openapi/users.json). [API authentication](https://app.telosplatforms.com/docs/authentication) explains credential setup. Substitute the configured API origin for other environments.

## Ask which authentication approach to implement

Before implementing authentication or context onboarding, ask:

> Would you like me to implement Telos-managed authentication end to end, or use your own authentication and then integrate Telos context?

Offer these two choices, without silently selecting one:

| Choice | Implementation |
|---|---|
| **Telos-managed auth end to end** | Implement signup/login UI, backend calls to Telos managed auth, secure app sessions, protected routes, logout, expiry/reauthentication, and error states. Configure the required scopes/secrets through the user's private configuration mechanism and verify the complete flow where credentials are available. |
| **My own auth + Telos context** | Preserve the app's existing login or use the user's chosen authentication solution. Verify its server-side session, then implement Connect Telos consent, token storage/renewal, context search, and explicit snippet selection for chat where requested and supported. Do not create Telos-managed login accounts for this path. |

An explicit instruction such as “keep my existing login” or a previously recorded project choice answers this question; do not ask again. Merely finding an auth dependency does not establish the user's choice. If the user chooses their own auth but has neither an implementation nor a selected provider, ask which solution to use before building login. Keep the decision pending while doing independent work; do not treat silence as a selection.

For the managed path, use the managed signup/login section below. Add Connect Telos separately if the user also wants context from existing Telos accounts: managed login does not grant that consent. For the own-auth path, use the OAuth pilot section after establishing the app session. If the request only reads connected context, it needs approved context OAuth access, not a workspace developer key or `/api/users` profile. Add developer-key setup and external-user mapping when ChatKit or another workspace API is required.

Record the selected approach in the project's Telos guidance and implement that path. “End to end” means the actual login/session/protected-route flow, not just forms or a mock. Respect the requested deployment scope; the choice does not itself authorize production deployment or creating real accounts for testing. Report missing credentials, pilot approval, unsupported lifecycle features, and untested live behavior explicitly.

## Separate credentials and identities

| Credential | Purpose | Storage |
|---|---|---|
| Telos developer session | Create/revoke developer keys in Telos | Developer account; never shipped to app users |
| Workspace developer API key | Public API calls with allowed scopes | Partner backend secret store |
| Context OAuth access/refresh tokens | Read a consenting person's Telos context | Partner backend, bound to its authenticated app user |

Your app also has an authenticated session, established by managed signup/login or existing app login. Neither a profile creation response nor an arbitrary external ID authenticates the browser user.

## Developer key and user mapping

Have the developer create a key in Telos with the scopes needed. Key management requires a developer session, not the key being managed. A frontend-only project needs server routes or functions for secret-bearing calls, implemented in its chosen backend language.

Typical scopes: `users:write`, `chatkit:message`, `chatkit:session:read`; add `chatkit:upload` for files and `chatkit:action:approve` for action decisions. Confirm the live contract and actual key scopes:

```sh
curl --fail-with-body "$TELOS_API_URL/api/chatkit/auth-check" \
  -H "Authorization: Bearer $TELOS_API_KEY"
```

Throughout these references, `TELOS_API_URL` is the verified API origin and `TELOS_API_KEY` is configured privately on the server. Shell examples are backend diagnostics, not frontend code.

Map each authenticated app user to a persistent external ID within the key's workspace. Provision that profile with `POST /api/users`; it creates/updates a profile, not a login account. Example test-user body:

```json
{
  "external_user_id": "user_123",
  "name": "Ada Example"
}
```

Save as `user.json` and run server-side:

```sh
curl --fail-with-body "$TELOS_API_URL/api/users" \
  -H "Authorization: Bearer $TELOS_API_KEY" \
  -H "Content-Type: application/json" --data-binary @user.json
```

Keep returned `external_user_id` and `telos_user_id` in the server mapping. Pass the external ID on subsequent developer-key requests after verifying app access and workspace membership. Email is a changeable attribute, not a linking key. Current external IDs permit letters, digits, `.`, `_`, `:`, `@`, and `-`; use an opaque persisted app ID if the login provider's subject contains unsupported characters.

## Managed app signup/login

Use for the user's selected Telos-managed path. Implement the UI, backend, and app-session lifecycle together, retaining any explicit project constraints. Read the [managed-auth schema](https://app.telosplatforms.com/api/public/openapi/users/auth0.json). The backend calls:

| Operation | Scope | Result |
|---|---|---|
| `POST /api/auth/signup` | `auth:user:create` | User/workspace context; no login token |
| `POST /api/auth/login` | `auth:user:login` | `access_token`, `token_type`, `expires_in`, and `user` |

Signup request body:

```json
{
  "email": "ada@example.com",
  "password": "replace-with-a-unique-password",
  "name": "Ada Example"
}
```

Login request body:

```json
{
  "email": "ada@example.com",
  "password": "replace-with-a-unique-password"
}
```

These are schema examples, not production credentials. Send actual user input from the backend with the developer key; never log passwords or tokens. Establish an app session only after successful login. Use returned `user.auth0_user_id` as the server's identity key, then provision a separate external profile through `/api/users` with an opaque valid external ID. This is an explicit app-to-chat mapping: do not assume the managed Auth0 row already has an external ID, auto-link it by email, or pass it as `payload.user_id` under a developer key. The current API has no profile-merge operation.

Use an HttpOnly cookie, Secure in HTTPS environments, appropriate SameSite/CSRF protection, and server-side expiry no later than the credential lifetime. Invalidate the session on logout. The published login response does not promise refresh tokens; require reauthentication on expiry unless the deployment documents renewal. Do not invent password-reset/account-linking endpoints. Document same-workspace login restrictions and surface signup conflicts.

## Connect Telos: approved-partner OAuth pilot

Use for the user's selected own-auth-plus-context path, or when they additionally request connected context alongside managed auth. App login and Telos context consent remain separate. A user with an existing Telos account consents to read-only context search. Registration is manually approved. Obtain issuer, client ID/secret, distinct context audience, allowed callback URL, and enabled API origin through Telos's approved onboarding channel; configure secrets privately.

The pilot defines `/api/context/v1/config`, `/api/context/v1/openapi.json`, and `POST /api/context/v1/search`, separately from the developer schema. A 401/403/404 from discovery is not a valid configuration. Confirm enrollment/deployment instead of trying workspace keys against another audience.

Use a maintained OAuth library in the project's language:

1. Require app login before connecting. Bind a single-use, expiring OAuth transaction to that stable app user.
2. Use Authorization Code with PKCE S256 and state. Request the supplied audience and `context:search offline_access` using the registered callback.
3. Validate state, transaction expiry, and initiating app session at callback. Reject replay/session changes. Exchange the code server-side with approved client authentication and the verifier; do not derive issuer/callback origin from untrusted headers.
4. Encrypt tokens server-side, bound to the initiating user. Honor expiry and rotation; serialize refreshes per connection to avoid reusing rotated tokens. On refresh denial, require reconnecting instead of switching credentials.
5. Send the context access token only to the approved Context API. It does not authorize developer-key chat calls.

Pilot configuration calls for five-minute access tokens and rotating refresh tokens with seven-day inactivity and 30-day absolute lifetimes; confirm issued values. Users revoke grants in Telos at `/connected-apps`. Revocation stops renewal; already-issued access tokens may remain usable until expiry. Local disconnect stops requests and deletes local tokens; link to Telos for grant revocation. The pilot does not promise a partner-facing revocation endpoint.

Continue with [Chat and context](chat-and-context.md) for selected context. Do not infer that the consenting Telos account is the same as the partner's managed-login account because emails match.

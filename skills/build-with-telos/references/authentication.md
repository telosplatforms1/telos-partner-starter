# Authentication and identity

Read the target deployment's [auth schema](https://app.telosplatforms.com/api/public/openapi/auth.json) and [users schema](https://app.telosplatforms.com/api/public/openapi/users.json). [API authentication](https://app.telosplatforms.com/docs/authentication) explains credential setup. Substitute the configured API origin for other environments.

## Ask which authentication approach to implement

When adding login and the authentication approach is unresolved, ask:

> Would you like me to implement Telos-managed authentication end to end, or use your own authentication and then integrate Telos context?

Offer these two choices, without silently selecting one:

| Choice | Implementation |
|---|---|
| **Telos-managed auth end to end** | Implement Google/Microsoft login through an approved Auth0 registration and/or email/password through Telos managed auth, according to the requested sign-in methods. Include secure app sessions, protected routes, logout, expiry/reauthentication, and error states. Configure the required scopes/secrets privately and verify the complete flow where credentials are available. |
| **My own auth + Telos context** | Preserve the app's existing login or use the user's chosen authentication solution. Verify its server-side session, then implement Connect Telos consent, per-user token storage, and API calls using the person’s global context and memory. Do not create Telos-managed login accounts for this path. |

An explicit request for registered-app OAuth preserves the app’s login and goes directly to [Connect with Telos](#connect-with-telos-registered-app-oauth). An instruction such as “keep my existing login” or a previously recorded project choice also answers this question; do not ask again. Merely finding an auth dependency does not establish the user's choice. If the user chooses their own auth but has neither an implementation nor a selected provider, ask which solution to use before building login. Keep the decision pending while doing independent work; do not treat silence as a selection.

For the managed path, use the social login or email/password section below for the requested methods. When asked for login like the Telos app, offer **Continue with Google** and **Continue with Microsoft** using the social flow. Add Connect Telos separately if the user also wants context from existing Telos accounts: managed login does not grant that consent. For the own-auth path, configure any requested social providers in the user's chosen authentication system, then use the registered-app OAuth section after establishing the app session. For the person’s existing global context, use their OAuth grant with the required Assistant or Inference scopes; do not create a workspace-local `/api/users` profile for that connection. Use developer-key setup and external-user mapping only for the separate workspace-profile path.

Record the selected approach in the project's Telos guidance and implement that path. “End to end” means the actual login/session/protected-route flow, not just forms or a mock. Respect the requested deployment scope; the choice does not itself authorize production deployment or creating real accounts for testing. Report missing credentials, OAuth app registration, unsupported lifecycle features, and untested live behavior explicitly.

## Separate credentials and identities

| Credential | Purpose | Storage |
|---|---|---|
| Telos developer session | Create/revoke developer keys in Telos | Developer account; never shipped to app users |
| Partner Auth0 application registration | Managed Google/Microsoft login for this app | Issuer/client ID are public configuration; client credentials and issued tokens stay on the partner backend |
| Workspace developer API key | Public API calls with allowed scopes | Partner backend secret store |
| Registered-app OAuth bearer token | Granted Assistant/Inference calls as the consenting person, with their global context and memory | App backend, bound to its authenticated app user |

Your app also has an authenticated session, established by managed signup/login or existing app login. Neither a profile creation response nor an arbitrary external ID authenticates the browser user.

## Developer key and user mapping

Before presenting working email/password signup/login or another developer-key integration, check configuration in the actual backend runtime without printing secret values. Social login uses the Auth0 registration described below; it also needs this developer-key preflight when mapping users for the Assistant API or another workspace API. A frontend-only project needs server routes or functions for secret-bearing calls, implemented in its chosen backend language. An `.env.example`, frontend dev server, or passing build does not establish that the backend has credentials.

If the key is missing, explicitly share a clickable [Create a Telos API key](https://app.telosplatforms.com/developer/api-keys) link in your message to the developer; use the configured Telos origin for other environments. Explain that they should sign in with their Telos developer account, select the intended workspace, and create a key with the required scopes. This is the app builder's backend credential; people signing up for the app do not need their own API keys. Have the developer store it as `TELOS_API_KEY` through the project's private server configuration. State the exact local configuration path or deployment secret setting and required scopes beside the link; never ask for the value in chat. Key management requires a developer session, not the key being managed. Continue independent implementation while configuration is pending, but report authentication as **awaiting configuration**, not complete.

Wire the backend's environment loader or secret injection into its actual start command. For a Vite app, loading frontend environment variables does not configure a separate backend process. Create any required app-session secret securely in private configuration, preserve existing secrets, keep local secret files ignored by Git, and restart/reload the backend after configuration changes. Recheck presence from that runtime, not just from the assistant's shell.

Typical Assistant API scopes: `users:write`, `assistant:write`, `assistant:read`; add `assistant:actions:approve` for action decisions. Inference API call sites need `inference:write`. Confirm the live contract and actual key scopes:

```sh
curl --fail-with-body "$TELOS_API_URL/v1/me" \
  -H "Authorization: Bearer $TELOS_API_KEY"
```

Throughout these references, `TELOS_API_URL` is the verified API origin and `TELOS_API_KEY` is configured privately on the server. Shell examples are backend diagnostics, not frontend code.

Run the key check with the backend's configured origin and credential. Verify `authenticated`, workspace, and required scopes from the response; a successful key check does not prove signup/login works. Treat missing configuration, rejected credentials, insufficient scopes, and upstream failures distinctly. If configuration is missing, show an unavailable state and disable signup/login submission before collecting credentials; keep developer setup details in server diagnostics and the setup handoff rather than exposing environment-variable instructions to app users.

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

## Managed Google and Microsoft login

Use for Google/Gmail and Microsoft/Outlook sign-in on the selected Telos-managed path. This requires an approved partner Auth0 application in Telos's tenant; the skill does not provision it. A workspace API key and the email/password endpoints below cannot perform social login. If registration is unavailable, report **awaiting Auth0 partner configuration**, continue independent UI work, and keep unconfigured sign-in actions unavailable.

### Registration and configuration

Obtain the approved issuer, app-specific client ID, client authentication method/credentials, exact callback and logout URLs, and enabled connection names from Telos. Register each environment's URLs and enable the requested connections for that partner application. Do not copy Telos's first-party client configuration or infer partner access from a provider button in the Telos app. Confirm whether Microsoft access covers personal Outlook accounts, work/school accounts, or both. Telos's tenant administrator owns the upstream Google/Microsoft configuration and credentials.

Keep private client credentials in the app's server configuration. Use the approved issuer's OIDC discovery document and a maintained library for the project's backend language. Request `openid profile email` for login; add an API audience or renewal scopes only when explicitly documented for this registration. Registered-app OAuth consent and an Auth0 login registration are separate capabilities; do not assume either grants the other.

### Shared login flow

1. Build **Continue with Google** and **Continue with Microsoft** using the existing UI kit. Both use one authorization/callback implementation, selecting the verified connection from server configuration. Never guess connection names or accept arbitrary browser-supplied connections, issuers, or redirect URLs.
2. Start Authorization Code with PKCE S256, state, and nonce. Bind a short-lived, single-use transaction to the initiating browser session and preserve only a validated internal return path. Redirect to Auth0 with the selected connection; the provider collects credentials.
3. At the registered callback, validate state and the transaction, exchange the code server-side using the verifier and registered client authentication, and let the OIDC library validate the ID token's signature, issuer, client audience, expiry, and nonce. Reject invalid/replayed callbacks; handle cancellation without creating a session. Clear the callback parameters with a clean redirect and avoid logging codes or tokens.
4. Establish an app session only after validation. Key identity by the verified issuer and subject (`iss`, `sub`), never by email. When Assistant API or other workspace APIs are needed, persist an opaque valid external ID for that identity and provision it through `/api/users` using the developer key. Do not auto-link Google, Microsoft, or password accounts by matching email, or substitute the social token for a workspace API key.
5. Store tokens server-side and use an HttpOnly session cookie, Secure on HTTPS, with appropriate SameSite/CSRF protection. Enforce server-side expiry, invalidate the local session on logout, and use only the documented provider logout/renewal behavior. Require reauthentication when renewal is unavailable or denied.

Login does not authorize Gmail/Outlook mailbox access or Telos global context access; those require their own connection and consent flows. Do not create password accounts through `/api/auth/signup` for social users.

With authorized test accounts, verify each enabled provider's login, cancellation, invalid/replayed callback rejection, logout/expiry, stable mapping on repeat login, and isolation between two users. Keep live provider verification distinct from mocked callback tests and build checks.

Protocol references: [Auth0 authorization code login and connection selection](https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow/add-login-auth-code-flow), [PKCE](https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow-with-pkce). These describe the protocol; they do not establish that a partner is enrolled in Telos.

## Managed email/password signup/login

Use for email/password on the user's selected Telos-managed path. Implement the UI, backend, and app-session lifecycle together, retaining any explicit project constraints. Read the [managed-auth schema](https://app.telosplatforms.com/api/public/openapi/users/auth0.json). The backend calls:

| Operation | Scope | Result |
|---|---|---|
| `POST /api/auth/signup` | `auth:user:create` | 202 pending verification with email and expiry; no Telos user UUID or login token |
| `POST /api/auth/login` | `auth:user:login` | `access_token`, `token_type`, `expires_in`, and `user` |

For this flow, configure `auth:user:create` and `auth:user:login`, plus `users:write` for the external-profile mapping below; confirm them against the target schema and key-check response. Complete the credential preflight above before asking the developer to try the form. Once configured, verify the real login/session/protected-route flow with authorized test credentials and signup only when account creation is authorized. Until then, distinguish implemented code and passing build checks from unverified live authentication.

Signup returns `status: pending_verification`, `email`, and `expires_at`. The provider sends verification instructions. After verification, login creates the Telos user in the API key workspace. The pending workspace registration expires after seven days; expired registrations require administrator assistance. An unverified login returns `email_verification_required`.

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

## Connect with Telos: registered-app OAuth

Use when an app should act as a person with their existing Telos profile, global context and memory. Keep the app's own login. This flow connects a Telos account; it does not return an OIDC ID token or establish your app's login session. Use the target environment's [Connect with Telos guide](https://app.telosplatforms.com/developers/users#connect-with-telos) alongside the public API schemas. OAuth registration/authorization operations may be absent from the focused public schemas; that does not justify substituting the retired Auth0 Context API pilot.

### Register the app

In [Platform → API keys → OAuth apps](https://app.telosplatforms.com/developer/api-keys), register the app name, exact redirect URIs and allowed scopes. Registration uses the app owner's signed-in Telos session (`POST /api/developer/oauth-clients`), not a developer key or an end-user grant. Use HTTPS callbacks in production; HTTP is accepted only for localhost/127.0.0.1 development. Choose a confidential client for a server app and store its once-returned client secret privately. Public clients use PKCE without a client secret.

Request only the capabilities needed: `assistant:write` for turns/uploads, `assistant:read` for the app's sessions, or `inference:write` for an existing model loop. Discover grantable permissions from the registration UI/contract; workspace administration, `users:write` and `assistant:actions:approve` are not user-grantable. `memory:sync` is for requested harness-file synchronization, not a prerequisite to using saved memory; it changes the grant's learning source to `harness_sync`. Do not add connector delegation or broader scopes to enable context.

### Authorize and exchange

1. Require a verified app session. Store a random state and PKCE verifier in a single-use, expiring transaction bound to that app user. Compute the S256 challenge with a maintained OAuth library.
2. Open `GET /api/oauth/authorize` on the configured Telos origin in a top-level redirect or popup, with `response_type=code`, `client_id`, the exact `redirect_uri`, space-separated `scope`, `state`, `code_challenge` and `code_challenge_method=S256`. This flow needs no Auth0 audience, `openid` or `offline_access`. Telos presents sign-in and consent, including a memory choice. Do not embed or recreate consent in an iframe.
3. At your callback, validate state, transaction expiry and the initiating app session before exchanging anything. Cancellation returns `error=access_denied` with state. Reject replay/session changes; clear callback parameters with a clean redirect. For a popup, validate both the callback origin and popup window before forwarding results to your backend.
4. Exchange the code server-side with `POST /api/oauth/token`, using `application/x-www-form-urlencoded`: `grant_type=authorization_code`, `client_id`, identical `redirect_uri`, `code` and `code_verifier`; confidential apps also send `client_secret` in that form. Codes expire after five minutes and can be used once. Replaying a consumed code revokes its issued grant, so do not automatically retry an exchange after an unknown outcome; start a new authorization.
5. Store the returned `access_token`, `token_type`, `expires_in` and `scope` privately, bound to the initiating app user. The bearer token is backed by a scoped Telos API key and currently lasts 90 days; honor the returned expiry. There are no refresh tokens. On expiry, revocation or rejected authorization, require reconnecting; do not try refresh grants or use the app owner's key.
6. Check `GET /v1/me` with this token to record the verified Telos user ID, workspace and scopes in the server-side connection. Do not auto-link accounts by matching email or accept a browser-supplied Telos identity. The token response itself does not include an identity or memory-settings object.

### Use and disconnect the connection

Send `Authorization: Bearer <user's access_token>` on the granted `/v1` operations. **Omit `external_user_id` everywhere**, including message bodies, payloads, session queries and uploads. A grant cannot select another user: attempts return HTTP 403 `grant_cannot_select_user`. Do not provision `/api/users` for this connection. OpenAI `user` and Anthropic `metadata.user_id` remain attribution fields; they cannot select another person's memory.

Context and memory belong to the approving person across their authorized apps; the registered app owner's workspace pays for usage. Assistant grants can use only `surface: "core"` and sessions created by that same OAuth app; shared memory does not grant access to all of the person's transcripts. The person's own scopes and resource permissions still apply. A grant cannot approve pending Assistant write actions on their behalf.

Users manage the named connection in Telos's API keys page, including memory settings and revocation. Revocation stops subsequent authenticated requests immediately; approving the same app again replaces that person's previous grant. Revoking the app registration invalidates all its grants. Local disconnect stops requests and deletes the app's stored token; it does not itself revoke the Telos grant. Do not claim disconnect erases existing memories or conversation history.

Continue with [Global context and memory](chat-and-context.md#use-global-context-and-memory) for API examples, learning behavior and verification.

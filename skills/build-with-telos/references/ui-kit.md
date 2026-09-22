# Telos UI kit

Use `@telos/ai-kit` for Telos components, tokens, themes, and styles. It is presentational React UI; auth, routing, networking, streaming state, and authorization belong in application containers.

## Verify access first

The kit is pre-release. On 2026-09-22, public npm returned 404 for `@telos/ai-kit`. This skill neither publishes the package nor bundles private source.

Check the configured registry or supplied artifact before promising installation:

```sh
npm view @telos/ai-kit version peerDependencies exports --json
```

If available, install an exact verified version using the project's package manager and lockfile. If Telos supplies a tarball/authenticated registry, verify its manifest identifies `@telos/ai-kit` and use that source. Do not invent versions, Git URLs, registries, or substitute packages. If unavailable, request kit access, continue independent API work, and mark Telos UI integration incomplete.

## Imports and composition

Inspect the accessible version's exports and peer dependencies. Current source supports React 18.2 or 19, React DOM, and `next-themes`. `next-themes` does not require Next.js; retain Vite for new frontends unless otherwise chosen.

Current source defines these entrypoints:

```tsx
import "@telos/ai-kit/tokens.css";
import "@telos/ai-kit/kit.css";
import "@telos/ai-kit/fonts.css";
import {
  ThemeProvider,
  Message,
  MessageContent,
  Response,
} from "@telos/ai-kit";

export function AssistantMessage({ text }: { text: string }) {
  return (
    <ThemeProvider defaultTheme="light">
      <Message role="assistant">
        <MessageContent role="assistant">
          <Response>{text}</Response>
        </MessageContent>
      </Message>
    </ThemeProvider>
  );
}
```

Place the provider once at the complete app's root, respecting an existing equivalent provider. Import fonts only when using bundled typography. Verify entrypoints against the supplied version; this source-based example is not a claim of package availability.

Useful exports include `Button`, `Input`, `FormField`, `Conversation`, `ConversationContent`, `PromptInput`, `PromptInputTextarea`, `PromptInputSubmit`, `Message`, `Response`, `Sources`, `ToolCall`, and `ThinkingIndicator`. Read installed prop types before use. `PromptInput` is a form; your app owns `onSubmit`, field state, and transport. A visual auth component does not authenticate users.

## Styling and boundaries

- Prefer kit components. Compose atoms → molecules → organisms; keep auth, router, React Query, and API calls in containers.
- Load tokens before component styles, then app token overrides. Preserve light/dark contrast and focus states.
- Current `BrandProvider` supports `telos` and `basic`, not arbitrary brand names. Customize through the installed release's CSS variables instead of inventing props.
- Prebuilt `kit.css` styles kit components. App-authored Tailwind utilities can use the current `designSystemTailwindTheme` export from `@telos/ai-kit/tailwind`; inspect the version and merge with existing configuration.
- Check layout, keyboard use, empty/loading/error states, and streaming text. Build with the actual artifact in the consuming app; an example alone does not prove package readiness.

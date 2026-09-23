# Telos UI kit

Use `@telosplatforms/ai-kit` for Telos components, tokens, themes, and styles. It is presentational React UI; auth, routing, networking, streaming state, and authorization belong in application containers.

## Install the released design system

Skill release 0.1.8 distributes `@telosplatforms/ai-kit@0.1.1`, including the catalog, as a [GitHub release asset](https://github.com/telosplatforms1/telos-partner-starter/releases/download/v0.1.8/telosplatforms-ai-kit-0.1.1.tgz). Use this exact artifact during design-system setup. The npm 0.1.0 release contains components and styles but no catalog.

Download it and verify its SHA-256 before installation:

```sh
curl --fail --location --output telosplatforms-ai-kit-0.1.1.tgz 'https://github.com/telosplatforms1/telos-partner-starter/releases/download/v0.1.8/telosplatforms-ai-kit-0.1.1.tgz'
shasum -a 256 telosplatforms-ai-kit-0.1.1.tgz
```

Expected SHA-256: `d72d3d1daea84fc3ebebff7244f753bc0c28c33dc272fcc2cd1b8c2bdd8434c7`. Check that the archive's `package/package.json` identifies `@telosplatforms/ai-kit` version `0.1.1`, and that `package/dist/storybook/index.html` and `index.json` exist. If download or verification fails, report that failure and continue independent work; do not substitute another package or generate a replacement catalog.

Install the verified archive using the project's package manager and lockfile:

```sh
npm install ./telosplatforms-ai-kit-0.1.1.tgz next-themes
```

Keep the archive at the project-relative path recorded by the lockfile so clean installs can resolve it. Keep the host app's React and React DOM versions aligned; add them only if absent. Installing the skill alone does not install the kit.

## Open the downloaded Telos design system

The kit includes a prebuilt Storybook at `dist/storybook` with the maintained Telos kit component stories, foundations, branding, controls, and light/dark themes. Use this catalog directly; do not initialize a replacement Storybook or generate a two-story showcase and call it the Telos design system. The catalog is built from the same sources as the release and requires no private repository or Storybook build dependencies in the consuming app.

1. Locate the installed package via its exported `package.json` (for example, `node -p "require.resolve('@telosplatforms/ai-kit/package.json')"`). Check that its sibling `dist/storybook/index.html` and `index.json` exist. If absent, obtain a verified catalog-bearing release or supplied tarball; mark catalog setup incomplete instead of synthesizing one.
2. Serve that `dist/storybook` directory on loopback with an available static HTTP server. For a standard npm install and Python 3:

   ```sh
   python3 -m http.server 6006 --bind 127.0.0.1 --directory node_modules/@telosplatforms/ai-kit/dist/storybook
   ```

   Resolve the actual package directory for other layouts. Reuse an existing server only if it serves this catalog; use a free port if 6006 belongs to another app. Preserve the consuming project's own Storybook and stories.
3. Read the served `index.json` and find the `Kit/Overview` / `All Components` story. Open its direct URL, normally `http://127.0.0.1:6006/?path=/story/kit-overview--all-components`. Never hand off a saved `/settings/guide` or onboarding URL.
4. Verify in the browser that the overview and a component's individual story render with Telos styles, that the catalog sidebar contains the component families, and that the light/dark toolbar works. An HTTP 200 or a ready server message alone is insufficient. If browser verification is unavailable, report that limitation.
5. Leave the static server running and share the verified direct catalog link. Then continue with the theme choice and authentication next step in the skill workflow. A preview theme toggle does not replace recording the patron's chosen app theme.

## Imports and composition

Inspect the accessible version's exports and peer dependencies. Version 0.1.1 supports React 18.2 or 19, React DOM, and `next-themes`. `next-themes` does not require Next.js; retain Vite for new frontends unless otherwise chosen.

Version 0.1.1 defines these entrypoints:

```tsx
import "@telosplatforms/ai-kit/tokens.css";
import "@telosplatforms/ai-kit/kit.css";
import "@telosplatforms/ai-kit/fonts.css";
import {
  ThemeProvider,
  Message,
  MessageContent,
  Response,
} from "@telosplatforms/ai-kit";

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

Place the provider once at the complete app's root, respecting an existing equivalent provider. After the design-system setup theme choice, set `defaultTheme` to the patron's selected `light` or `dark` value; the example's `light` is illustrative, not an assumed preference. Apply that choice consistently to app surfaces and kit components using the design-system tokens. Import fonts only when using bundled typography. Verify entrypoints against the installed version when upgrading.

Useful exports include `Button`, `Input`, `FormField`, `Conversation`, `ConversationContent`, `PromptInput`, `PromptInputTextarea`, `PromptInputSubmit`, `Message`, `Response`, `Sources`, `ToolCall`, and `ThinkingIndicator`. Read installed prop types before use. `PromptInput` is a form; your app owns `onSubmit`, field state, and transport. A visual auth component does not authenticate users.

## Styling and boundaries

- Prefer kit components. Compose atoms → molecules → organisms; keep auth, router, React Query, and API calls in containers.
- Load tokens before component styles, then app token overrides. Preserve light/dark contrast and focus states.
- Current `BrandProvider` supports `telos` and `basic`, not arbitrary brand names. Customize through the installed release's CSS variables instead of inventing props.
- Prebuilt `kit.css` styles kit components. App-authored Tailwind utilities can use the current `designSystemTailwindTheme` export from `@telosplatforms/ai-kit/tailwind`; inspect the version and merge with existing configuration.
- Check layout, keyboard use, empty/loading/error states, and streaming text. Build with the actual artifact in the consuming app; an example alone does not prove package readiness.

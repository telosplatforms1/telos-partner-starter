# Telos UI kit

Use `@telosplatforms/ai-kit` for Telos components, tokens, themes, and styles. It is presentational React UI; auth, routing, networking, streaming state, and authorization belong in application containers.

## Install the neutral kit

The verified `@telosplatforms/ai-kit@0.2.0` archive is published at [the kit 0.2.0 release](https://github.com/telosplatforms1/telos-partner-starter/releases/tag/ai-kit-v0.2.0). Download [the archive](https://github.com/telosplatforms1/telos-partner-starter/releases/download/ai-kit-v0.2.0/telosplatforms-ai-kit-0.2.0.tgz) and [SHA256SUMS](https://github.com/telosplatforms1/telos-partner-starter/releases/download/ai-kit-v0.2.0/SHA256SUMS), then verify it before installation:

```sh
shasum -a 256 -c SHA256SUMS
```

The archive SHA-256 is `d2575f2cd24509cd4af9b010b2a9f5203f1653edf2585a2932065acc505588f4`. Install the local archive with the project's package manager and lockfile. Confirm that it contains `dist/tokens.css`, `dist/theme-template.css`, `dist/kit.css`, and `dist/storybook/index.html` plus `index.json`. If verification fails, report the blocker; never use an older branded package or synthesize a replacement catalog.

Version 0.2.0 removes the public `BrandProvider`, `useBrand`, `BrandName`, and the `MessageContent` `telos` preset. Preserve component props otherwise. Keep the project's React and React DOM aligned. `ThemeProvider` continues to own light/dark/system mode.

## Give the project its own theme

Inspect the existing project styles and brand guide first. Ask only for unresolved preferences: brand/accent colors, typography, visual style, and light/dark/system mode. Preserve an existing project theme location; otherwise create `src/theme/theme.css` using the installed `@telosplatforms/ai-kit/theme-template.css` as a starting point. Keep local fonts and images inside that theme folder and use relative URLs so the same files work in the app and catalog.

Load styles in this order at the application root: `@telosplatforms/ai-kit/tokens.css`, `@telosplatforms/ai-kit/kit.css`, then the project's theme stylesheet. Keep any existing equivalent color-mode provider; otherwise use the kit `ThemeProvider` with the user's selected mode. Configure Tailwind utilities to use the `designSystemTailwindTheme` export or its CSS variables so `primary`, radii, font families, and shadows follow the project CSS.

## Prepare and preview the theme

Use `scripts/prepare-design-system-preview.mjs` from the installed skill. Locate the kit package directory from its exported `package.json`, then prepare from the app root:

```sh
node <installed-build-with-telos-skill>/scripts/prepare-design-system-preview.mjs \
  --package-dir node_modules/@telosplatforms/ai-kit \
  --project-dir . \
  --theme-dir src/theme
```

The script copies the static catalog into `.telos/design-system-preview`, copies the entire theme folder to the catalog's `theme/` directory, and adds that generated preview path to `.gitignore`. It refuses to replace an unmarked directory, never changes the installed kit or source theme, and preserves relative asset paths.

Serve the generated preview on loopback with Python 3 (or an existing static server):

```sh
python3 -m http.server 6006 --bind 127.0.0.1 --directory .telos/design-system-preview
```

Open `http://127.0.0.1:6006/?path=/story/kit-overview--all-components`. Check representative components in light and dark mode and verify the project stylesheet is loaded. After each theme edit, run the preparation script again and reload the catalog; review changes against the project source theme. The catalog's default is neutral when no project theme exists.

## Imports and composition

Version 0.2.0 supports React 18.2 or 19, React DOM, and `next-themes`. `next-themes` does not require Next.js; retain Vite for new frontends unless otherwise chosen.

Version 0.2.0 defines these entrypoints:

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
- Theme identity belongs to the project stylesheet. The kit exposes no fixed brand registry or Telos preset.
- Prebuilt `kit.css` styles kit components. App-authored Tailwind utilities can use the current `designSystemTailwindTheme` export from `@telosplatforms/ai-kit/tailwind`; inspect the version and merge with existing configuration.
- Check layout, keyboard use, empty/loading/error states, and streaming text. Build with the actual artifact in the consuming app; an example alone does not prove package readiness.

# Telos UI kit

Use `@telosplatforms/ai-kit` for Telos components, tokens, themes, and styles. It is presentational React UI; auth, routing, networking, streaming state, and authorization belong in application containers.

## Verify access first

`@telosplatforms/ai-kit@0.1.0` is published on [public npm](https://www.npmjs.com/package/@telosplatforms/ai-kit). No private Telos repository or registry access is required to install it. Verify the requested version before installation; the skill does not install or publish packages merely by being installed.

Check the configured registry or supplied artifact before promising installation:

```sh
npm view @telosplatforms/ai-kit@0.1.0 version peerDependencies exports --json
```

If available, install an exact verified version using the project's package manager and lockfile. If Telos supplies a tarball/authenticated registry, verify its manifest identifies `@telosplatforms/ai-kit` and use that source. Do not invent versions, Git URLs, registries, or substitute packages. If unavailable, request kit access, continue independent API work, and mark Telos UI integration incomplete.

For the verified initial release, install with the project’s package manager:

```sh
npm install @telosplatforms/ai-kit@0.1.0 next-themes
```

Keep the host app’s React and React DOM versions aligned. Add those dependencies
only if the project does not already provide them.

## Start Storybook after installation

Once the design system is installed, run the consuming project's Storybook development script with its package manager. Reuse an existing running instance. If Storybook is not configured, set it up for the project's framework with a minimal story using the installed kit, its styles, and theme provider; installing the kit alone does not supply a Storybook server. Respect the patron's selected light/dark theme in the preview once chosen.

Verify that Storybook starts and serves the preview, leave it running, and share the actual local URL. If startup fails, report the concrete blocker without claiming it is running. Then guide the patron through the theme choice and authentication next step in the skill workflow.

## Imports and composition

Inspect the accessible version's exports and peer dependencies. Version 0.1.0 supports React 18.2 or 19, React DOM, and `next-themes`. `next-themes` does not require Next.js; retain Vite for new frontends unless otherwise chosen.

Version 0.1.0 defines these entrypoints:

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

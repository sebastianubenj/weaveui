# weaveui

React + TypeScript design system and storefront in one git repo. Visual language comes from [Figma](https://www.figma.com/design/PMZpYxijxLhjDlvMbtVY5j/weaveui).

- `packages/ds` (`@weaveui/ds`): tokens, foundations, controls, icons, and the six form patterns. Storybook on port 6006 is the DS catalog.
- `apps/store` (`@weaveui/store`): routes, AuthLayout, Navigation, ProductCard, Home, product assets. Consumes the DS through its package exports. `npm run dev` runs this app.

Do not copy Button or other DS components into the store. The DS can be built and packed for local validation; it remains private and is not published to a registry.

## Run

```bash
npm install
npx playwright install chromium
npm run storybook
```

Design system Storybook: [http://localhost:6006](http://localhost:6006)

```bash
npm run dev
```

Store: [http://localhost:5173](http://localhost:5173)

Build the local DS package artifact with `npm run build:package --workspace @weaveui/ds`. Store resolves the compiled package entry, declarations, and stylesheet through npm workspace exports; it does not alias the DS source tree.

Copy `apps/store/.env.example` to `apps/store/.env` and set the Supabase project URL and public anon key to enable authentication. Configure the project's allowed email redirects for `/login` and `/reset-password` on your local and deployed origins. The forms require passwords of at least 15 characters; configure the backend password policy accordingly in [Supabase Auth](https://supabase.com/docs/guides/auth/password-security).

Registration and password recovery check compromised passwords on submission using the [Pwned Passwords range API](https://haveibeenpwned.com/API/v3#PwnedPasswords). Only a five-character SHA-1 prefix is sent, with response padding; the password and full hash stay in the browser. An unavailable check blocks submission and allows retry. This client check complements the backend policy.

The demo bag persists product IDs and quantities in this browser. Catalog search results, the cart page, and checkout are pending design. Storybook's authentication flows use a simulated Supabase client and password checker, so interaction tests do not create real accounts or call either service.

```bash
npm run storybook:store
```

Store Storybook (views and commerce components): [http://localhost:6007](http://localhost:6007)

```bash
npm run check
```

`check` runs typecheck, lint, token tests, Storybook interaction tests, and production builds for every workspace.

Accessibility: `@storybook/addon-a11y` fails `npm test` on CSF violations (`parameters.a11y.test: 'error'`). See [`packages/ds/.storybook/a11y-status.md`](packages/ds/.storybook/a11y-status.md).

## Tokens

For a small, targeted variable change, Codex can read the exact definitions from Figma MCP and merge only those entries into the existing raw export. This is only used when MCP provides all metadata required by the export schema; unrelated entries are preserved. For broad changes, full collection updates, or incomplete MCP data, use the development plugin for a complete export.

Full exports use the development plugin in `packages/ds/figma/export-variables/`:

1. In Figma: Plugins → Development → Import plugin from manifest… → `packages/ds/figma/export-variables/manifest.json`.
2. Run **Export variables**. Save the download as `packages/ds/tokens/figma-variables.raw.json`.
After either update path, run `npm run tokens:normalize` to rewrite primitives and semantics in `packages/ds/tokens/tokens.json` and the Dark mode of Semantic Colors in `packages/ds/tokens/tokens.dark.json`. Font, typography, and effect styles in `tokens.json` stay as they are.
Then run `npm run build:tokens` to write `packages/ds/src/styles/generated/tokens.css` and `tokens.dark.css`.

Dark mode is applied with `data-weaveui-theme="dark"` on `<html>` or a theme wrapper. Storybook has a Theme switch in the toolbar.

The DS package exposes `@weaveui/ds/styles.css` for component tokens, fonts, and utilities without a global reset, `@weaveui/ds/preflight.css` for an optional Tailwind reset, and `@weaveui/ds/preset.css` for the complete Store defaults. Store uses the preset; consumers with their own reset or global theme can import only `styles.css`.

Shared implementation instructions for coding agents (tokens, components, patterns, and testing) live in [`AGENTS.md`](AGENTS.md). `.cursor/rules/` is reserved for Cursor-specific guidance.

## Layout

| Path | Role |
| --- | --- |
| `packages/ds/src/components/ui/` | DS components (Button, Field, FormAlert, Input, Link, …) |
| `packages/ds/src/components/icon/` | Curated icon registry |
| `packages/ds/src/foundations/` | Token specimens (color, type, space, …) |
| `packages/ds/src/patterns/` | Form patterns matching Figma Patterns (Log in, Sign up, Forgot password, Check your email, Set a new password, Password updated) |
| `apps/store/src/views/` | Store screens: Home, Login, Register, Forgot password, Reset password, Password updated, Expired link |
| `apps/store/src/components/ui/` | Store chrome: Navigation, ProductCard, bag preview |
| `packages/ds/figma/export-variables/` | Figma plugin that downloads every local variable |
| `packages/ds/tokens/` | Token source and Figma variable export |
| `packages/ds/src/styles/generated/` | Generated CSS from `npm run build:tokens` |

Each DS UI component has `.tsx`, `.stories.tsx`, and `.mdx`. Usage pages are the MDX files in Storybook.

## License

The `packages/ds` package is licensed under MIT. The bundled Inter font remains under SIL Open Font License 1.1; see [`packages/ds/LICENSES/Inter-OFL-1.1.txt`](packages/ds/LICENSES/Inter-OFL-1.1.txt). This license does not extend to the rest of the repository.

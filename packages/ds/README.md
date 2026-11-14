# @weaveui/ds

Weave UI's React design system. Its package API is the package root plus three stylesheet entry points; Figma tokens, component source, and build scripts remain in this workspace.

## Build a local package artifact

From the repository root:

```bash
npm run build:package --workspace @weaveui/ds
npm pack --workspace @weaveui/ds --pack-destination /tmp
```

The resulting tarball can be installed by a local consumer project for validation. The package is still private and this workflow does not publish it to a registry.

## Consume

Install the tarball in a React 19 project, then import the stylesheet once from the app entry point:

```tsx
import "@weaveui/ds/preset.css";
import { Button, Field, Input } from "@weaveui/ds";
```

React and React DOM are peer dependencies. Choose a stylesheet based on the host app:

- `@weaveui/ds/styles.css` provides Weave UI tokens, Inter, and the compiled utilities used by DS components. It does not apply a reset or set styles on `html` and `body`.
- `@weaveui/ds/preflight.css` provides Tailwind Preflight as an optional reset. Import it only if the host app does not already use a reset.
- `@weaveui/ds/preset.css` combines both files and adds the page level typography, border, focus ring, and background defaults used by Store and Storybook.

The theme tokens use the `--weaveui-*` namespace for shadcn compatible colors and radius. Dark tokens activate when `data-weaveui-theme="dark"` is set on the root element or an ancestor of the components.

## Licenses

Weave UI's package code is licensed under MIT; see `LICENSE`. The bundled Inter font files remain under SIL Open Font License 1.1; see `LICENSES/Inter-OFL-1.1.txt`.

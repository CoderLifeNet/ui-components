# Adoption For Existing Apps

## Install Paths

1. npm-published pair (verified now):

```bash
pnpm add @coderlifenet/ui-components@0.2.0-alpha.0 @coderlifenet/ui-core@0.2.0-alpha.0 @mui/material@9.4.0 @emotion/react@11.14.0 @emotion/styled@11.14.1 react@19.2.8 react-dom@19.2.8
```

2. Coordinated source pair (for local `0.2.0-alpha.0` verification):

```bash
# in ui-core
pnpm pack:local

# in ui-components
pnpm pack:local
pnpm check:consumers
```

## Incremental Adoption

1. Keep existing `ThemeProvider` and MUI theme augmentation modules.
2. Adopt `@coderlifenet/ui-core` wrappers across ordinary app controls (buttons, inputs, select/radio/checkbox, links) throughout the app.
3. Introduce `DataTable`, `TreeExplorer`, and `DashboardLayout` only where those specialized components fit your use case.
4. Keep TrackForge ordinary app forms on their current path.
5. Use a separate form-builder surface only for user-created workflow templates.
6. Enable analytics runtime only after consent flow is wired.

## TrackForge + Form Builder Boundary

- TrackForge ordinary app forms:
	use existing app forms (or direct `@coderlifenet/ui-core` wrappers) for first-party operational screens.
- TrackForge shell and tables:
	no forced migration to `@coderlifenet/ui-components`; use those components only where they add value.
- Form builder:
	use a separate builder-style editor for user-created workflow schemas, not as a replacement for TrackForge's ordinary app forms.

## docs/demo-app Local Tarball Workflow (Fresh Checkout)

```bash
# fresh checkout with sibling repositories
git clone https://github.com/CoderLifeNet/ui-core.git
git clone https://github.com/CoderLifeNet/ui-components.git

# pack the exact local tarballs referenced by docs/demo-app/package.json
cd ui-core
pnpm install --frozen-lockfile
pnpm pack:local

cd ../ui-components
pnpm install --frozen-lockfile
pnpm pack:local

# install and run the demo fixture from local tarballs
cd docs/demo-app
npm ci --ignore-scripts --no-audit --no-fund
npm run build
npm run dev
```

Notes:

- This workflow requires `ui-core` and `ui-components` as sibling folders so file-based tarball paths resolve exactly.
- `npm run build` was re-verified during this docs update on the pinned `0.2.0-alpha.0` local tarballs.
- If `npm ci` fails, treat it as a lockfile/path drift signal:
	1. verify sibling paths and rerun both `pnpm pack:local` commands;
	2. if `docs/demo-app/package-lock.json` is stale after intentional path/version updates, regenerate it once with `npm install --package-lock-only --ignore-scripts --no-audit --no-fund`, commit that lockfile fix, then rerun the exact documented `npm ci` and `npm run build` commands.

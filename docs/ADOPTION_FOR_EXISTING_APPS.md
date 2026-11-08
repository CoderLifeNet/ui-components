# Adoption For Existing Apps

## Install Paths

1. npm-published pair (verified now):

```bash
pnpm add @coderlifenet/ui-components@0.2.0-alpha.1 @coderlifenet/ui-core@0.2.0-alpha.1 @mui/material@9.4.0 @emotion/react@11.14.0 @emotion/styled@11.14.1 react@19.2.8 react-dom@19.2.8
```

2. Coordinated source pair (for local `0.2.0-alpha.1` verification):

```bash
# in ui-core
pnpm pack:local

# in ui-components
node scripts/prepare-artifacts.mjs --root
pnpm install --frozen-lockfile
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

For a release candidate under review, check out its Components branch before
building. Use the exact Core commit pinned by Components CI.

```bash
# fresh checkout with sibling repositories
git clone https://github.com/CoderLifeNet/ui-core.git
git clone https://github.com/CoderLifeNet/ui-components.git

# pack the exact local tarballs referenced by docs/demo-app/package.json
cd ui-core
git checkout --detach fa612955f578c655332e316b09bc058732d55a42
pnpm install --frozen-lockfile
pnpm pack:local

cd ../ui-components
node scripts/prepare-artifacts.mjs --root
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
- The demo fixture pins both local tarballs at `0.2.0-alpha.1`.
- If `npm ci` fails, treat it as a lockfile/path drift signal:
	1. verify sibling paths and rerun both `pnpm pack:local` commands;
	2. if `docs/demo-app/package-lock.json` is stale after intentional path/version updates, regenerate it once with `npm install --package-lock-only --ignore-scripts --no-audit --no-fund`, commit that lockfile fix, then rerun the exact documented `npm ci` and `npm run build` commands.

# @coderlifenet/ui-components

Advanced components built on top of `@coderlifenet/ui-core` public APIs only.

## Components

- `DataTable`
- `TreeExplorer`
- `DashboardLayout`

## Install (npm-verified today)

```bash
pnpm add @coderlifenet/ui-components@0.1.0-alpha.2 @coderlifenet/ui-core@0.1.0-alpha.2 @mui/material@9.4.0 @emotion/react@11.14.0 @emotion/styled@11.14.1 react@19.2.8 react-dom@19.2.8
```

Version snapshot (2026-10-12):

- `@coderlifenet/ui-components`: `alpha` and `latest` both resolve to `0.1.0-alpha.2`.
- `@coderlifenet/ui-core`: `alpha` resolves to `0.2.0-alpha.0`, `latest` resolves to `0.1.0-alpha.2`.
- Coordinated `0.2.0-alpha.0` usage requires local source artifacts until components publish completes.

## Usage

```tsx
import { DataTable, TreeExplorer, DashboardLayout } from "@coderlifenet/ui-components";
```

## Feature Scope

- DataTable: typed columns/rows, sorting/filtering/pagination/selection, loading/empty/error states, toolbar actions.
- TreeExplorer: typed hierarchical nodes, controlled/uncontrolled expansion and selection, keyboard support.
- DashboardLayout: responsive shell with header/sidebar/navigation/breadcrumb slots and mobile drawer behavior.

## Tracking Integration Notes

- `semanticTrackingOnly` defaults to `true` for `DataTable` and `DashboardLayout`.
- Owned internal controls suppress primitive duplicate events while semantic component events remain emitted.
- Consumer-provided children/slots (toolbar actions, header/sidebar slots, dashboard body content) still track normally unless a consumer ancestor opts out.
- TreeExplorer semantic events no longer auto-promote node identifiers into tracking semantic IDs.

These integration APIs are validated in the coordinated `0.2.0-alpha.0` source line. npm currently serves `@coderlifenet/ui-components@0.1.0-alpha.2`.

## Local Source Validation Workflow

Use fresh local candidate bytes from source before consumer checks:

1. In `ui-core`: `pnpm pack:local`
2. In `ui-components`: `pnpm pack:local`
3. In `ui-components`: `pnpm check:consumers && pnpm check:external-consumer`

Consumer lockfiles may be rewritten during local artifact install checks; treat those lockfile edits as transient verification output and keep PR diffs limited to durable library sources/tests/docs.

## Executable Demo Fixture

- Source: `consumers/vite-app/src/App.tsx`
- Includes: stable runtime update pattern, StrictMode render, consent/enablement controls, scope boundaries, explicit file-input emit, ui-components content, and in-memory event inspector.
- Run: `pnpm check:consumers`

## Notes

- This package does not claim MUI X Pro/Premium compatibility.
- Large-data virtualization, grouping, pivoting, and charting are roadmap items.

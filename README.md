# @coderlifenet/ui-components

Advanced components built on top of `@coderlifenet/ui-core` public APIs only.

## Components

- `DataTable`
- `TreeExplorer`
- `DashboardLayout`

## Install

```bash
pnpm add @coderlifenet/ui-components@0.1.0-alpha.2 @coderlifenet/ui-core@0.1.0-alpha.2 @mui/material@9.4.0 @emotion/react@11.14.0 @emotion/styled@11.14.1 react@19.2.8 react-dom@19.2.8
```

## Usage

```tsx
import { DataTable, TreeExplorer, DashboardLayout } from "@coderlifenet/ui-components";
```

## Feature Scope

- DataTable: typed columns/rows, sorting/filtering/pagination/selection, loading/empty/error states, toolbar actions.
- TreeExplorer: typed hierarchical nodes, controlled/uncontrolled expansion and selection, keyboard support.
- DashboardLayout: responsive shell with header/sidebar/navigation/breadcrumb slots and mobile drawer behavior.

## Notes

- This package does not claim MUI X Pro/Premium compatibility.
- Large-data virtualization, grouping, pivoting, and charting are roadmap items.

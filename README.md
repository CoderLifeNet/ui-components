# @coderlife/ui-components

Advanced components built on top of `@coderlife/ui-core` public APIs only.

## Components

- `DataTable`
- `TreeExplorer`
- `DashboardLayout`

## Install

```bash
pnpm add @coderlife/ui-components @coderlife/ui-core
```

## Usage

```tsx
import { DataTable, TreeExplorer, DashboardLayout } from "@coderlife/ui-components";
```

## Feature Scope

- DataTable: typed columns/rows, sorting/filtering/pagination/selection, loading/empty/error states, toolbar actions.
- TreeExplorer: typed hierarchical nodes, controlled/uncontrolled expansion and selection, keyboard support.
- DashboardLayout: responsive shell with header/sidebar/navigation/breadcrumb slots and mobile drawer behavior.

## Notes

- This package does not claim MUI X Pro/Premium compatibility.
- Large-data virtualization, grouping, pivoting, and charting are roadmap items.

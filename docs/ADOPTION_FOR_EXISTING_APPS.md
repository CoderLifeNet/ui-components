# Adoption For Existing Apps

## Install Paths

1. npm-published pair (verified now):

```bash
pnpm add @coderlifenet/ui-components@0.1.0-alpha.2 @coderlifenet/ui-core@0.1.0-alpha.2 @mui/material@9.4.0 @emotion/react@11.14.0 @emotion/styled@11.14.1 react@19.2.8 react-dom@19.2.8
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
2. Introduce `DataTable`, `TreeExplorer`, and `DashboardLayout` in one route/feature at a time.
3. Keep TrackForge ordinary app forms on their current path.
4. Use a separate form-builder surface only for user-created workflow templates.
5. Enable analytics runtime only after consent flow is wired.

## TrackForge + Form Builder Boundary

- TrackForge ordinary app forms:
	use existing app forms (or direct `@coderlifenet/ui-core` wrappers) for first-party operational screens.
- Form builder:
	use a separate builder-style editor for user-created workflow schemas, not as a replacement for TrackForge's ordinary app forms.

# Architecture Decisions

## ADR-001: Consume ui-core as a Package Boundary

Status: accepted.

Decision:
- `ui-components` imports only from published/tarball package entry points of `@coderlife/ui-core`.

Rationale:
- Prevents hidden coupling to unpublished internals.

## ADR-002: Framework-neutral Navigation APIs

Status: accepted.

Decision:
- `DashboardLayout` accepts generic navigation callbacks and hrefs.

Rationale:
- Keeps integration router-neutral for React Router, Next.js, and custom shells.

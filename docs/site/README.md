# Coder Life UI documentation preview

Private static app for the public `@coderlifenet/*` alpha. Canonical requirements:
[coderlife.net PR #20](https://github.com/CoderLifeNet/coderlife.net/pull/20).
Decisions, data inventory, release-tag handoff and acceptance evidence:
[UI foundation](../UI_FOUNDATION.md).

## Reproduce locally

Node 22.22.3, npm 10.9.8. From this directory:

```sh
npm ci --ignore-scripts
npm run format:check
npm run lint
npm run build
npm exec playwright install chromium
npm run preview -- --port 4321 --strictPort
```

Open <http://127.0.0.1:4321/>. In a second terminal in this directory:

```sh
npm run test:browser
npm audit
```

Set `DOCS_URL` for another loopback port and `DOCS_EVIDENCE` to an absolute directory
outside every repository. Default screenshots/results:
`/tmp/coderlifenet-ui-foundation-evidence`. These are disposable, not committed.
Development: `npm run dev -- --port 4322 --strictPort`. Only production preview
tests prerendering/headers. Stop either server with Ctrl-C.

## Boundaries

- Exact registry runtime dependencies in the npm lock. No workspace aliases,
  tarball overrides or internal `@coderlife/*` imports.
- Generated inventory covers package entry points, not complete named API detail.
  Nine routes plus static 404; future hosting must serve HTTP 404, not SPA fallback.
- Reviewed TSX is compiled and displayed as escaped raw source. Reset remounts an
  error boundary. No editor, arbitrary execution, remote imports or snippet upload.
- DataTable uses named subpath exports; controlled hosts reset page when filter
  or page size changes. The fixture demonstrates this contract.
- Appearance and version-local search stay in memory. No-JS docs use system CSS.
- No site telemetry. Button uses isolated memory-only consent, not a complete CMP.
- Production headers, canonical URLs, sitemap, caching, logs, DNS and deployment
  require separate approval. Preview is noindex/nofollow, self-only scripts and
  connections, no frames. MUI/Emotion require inline styles.

## Validation

Enforced budgets: total JS gzip <250 KiB, CSS gzip <45 KiB; all inventory routes
and catalog anchors resolve; headings/noindex in static HTML. Local unthrottled
DOMContentLoaded <5 seconds is a regression budget, not production Web Vitals.
UI-6 must add throttled LCP/INP/CLS and deployment-transfer measurements.

Chromium checks 1440x1000 and 390x844 light/dark: four primary routes, axe WCAG A/AA,
overflow, consent/opt-out/reset, source/copy, table states/filter/sort/selection/
pagination, theme, keyboard skip, search, no external requests/storage, mobile
no-JS text/navigation. Owner visual and assistive-technology review remain required.
UI-5 Firefox/WebKit isolation is not accepted. UI-2 through UI-7 remain pending.

Root library ESLint is separately blocked by existing TypeScript 7/parser
compatibility; site Oxlint is not a waiver. Only three reviewed templates exist.

## Attribution

Independent project built on Material UI, not affiliated with or endorsed by MUI.
Rolling guide/API links are distinguished from immutable v9.4.0 source. Local
fonts and icons retain dependency license files; no upstream documentation or
brand artwork is copied. Full dependency-license review remains a UI-6 gate.

# UI documentation foundation

Canonical product requirements remain in
[coderlife.net PR #20](https://github.com/CoderLifeNet/coderlife.net/pull/20),
`docs/UI_DOCUMENTATION_ROADMAP.md`, sections 1-8. This record owns technical
decisions and UI-0/UI-1 evidence, not a competing roadmap.

## ADR: source and rendering ownership

- Source: `ui-components/docs/site`, a private static documentation application.
- Library maintainers own examples, export inventory, accessibility and release
  compatibility. coderlife.net maintainers own ecosystem navigation and roadmap.
- Consume exact published `@coderlifenet/ui-core` and `@coderlifenet/ui-components`
  version `0.1.0-alpha.2`; never alias local source or tarballs. Internal
  `@coderlife/*` packages in coderlife.net are unchanged.
- Prerender all declared UI-1 routes, then hydrate reviewed React examples. Static
  HTML retains documentation, source and navigation with JavaScript disabled.
- Use CSS system-theme selection before first paint. Explicit theme changes are
  session-memory only, avoiding stored preference hydration mismatches. Saved
  server-readable preferences belong to a later hosting decision.
- Hosting is a proposed static artifact on the owner's existing VPS, with no new
  runtime service. Owner approval of headers, TLS, logs, DNS and rollout remains
  UI-6/UI-7 work. No deployment or hosted-workflow activation is part of UI-1.

## ADR: reviewed examples, not arbitrary execution

UI-1 only executes repository-reviewed, compiled examples. Controls select bounded
booleans, enums and deterministic fixture state. Source is rendered as escaped text;
there is no editor, eval, Function constructor, iframe runner, user-selected import,
remote dependency, snippet storage, upload, sharing or URL-supplied code execution.
Search and example state stay in ephemeral browser memory. Real analytics is off.

UI-5 remains blocked until a reviewed runner ADR covers distinct credential-free
origin and sibling-domain cookies, sandbox/CSP/Permissions Policy, prebundled imports,
all exfiltration channels, parent navigation, storage, validated bounded messaging,
resource exhaustion, kill/reset and Chromium/Firefox/WebKit negative tests. An iframe
alone does not establish isolation. If these controls cannot be demonstrated, use a
bounded grammar instead of arbitrary TSX. Never weaken the main site's CSP.

## Release tag investigation (2026-09-11 UTC)

Both public registry snapshots still show `alpha` and `latest` at `0.1.0-alpha.2`.
No stable latest version exists in this snapshot. No tags or versions were changed.
The earlier removal returned E403; today's authenticated `npm whoami` returns E401.
Therefore current authenticated package permissions cannot be established and the
precise cause of the historical E403 is unproven. No repeated write attempt or broader
credential request was made. Current npm docs require package write access and any
configured second-factor challenge for dist-tag mutation; organization-management
rights alone do not establish package write permission. Stage-only tokens can change
tags, so direct-publish permission is not a necessary escalation for this action.

Owner action, in a private terminal: run `npm login`, complete npm's interactive
authentication, then `npm whoami` and `npm access list packages chrishacia --json`.
Confirm read-write access to just these packages. Re-read `npm dist-tag ls` for each;
preserve latest if it now names a stable version. If still alpha.2, run:

```sh
npm dist-tag rm @coderlifenet/ui-core latest --registry=https://registry.npmjs.org/
npm dist-tag rm @coderlifenet/ui-components latest --registry=https://registry.npmjs.org/
```

Complete any 2FA challenge directly, never in chat. Verify `alpha` remains alpha.2,
latest is absent and all published versions remain. Do not unpublish or republish.

Read-only before/after verification commands:

```sh
npm view @coderlifenet/ui-core dist-tags versions --json
npm view @coderlifenet/ui-components dist-tags versions --json
```

References: [npm dist-tag](https://docs.npmjs.com/cli/v11/commands/npm-dist-tag),
[token permissions](https://docs.npmjs.com/about-access-tokens).

## UI-0 inventory and ownership

Technical records completed for review on 2026-09-11; owner acceptance pending.
[Foundation owner issue](https://github.com/CoderLifeNet/ui-components/issues/1)
is assigned to chrishacia. Chris owns architecture/hosting/privacy approval;
library maintainers own API evidence and docs. Review inventory on every release,
pending work monthly, and isolation on browser/editor/dependency changes.

The [generated inventory](site/src/generated/inventory.json) covers all installed
public alpha.2 package export-map entry points using manifests, packed MUI surface
data and built wrapper imports. It maps package/subpath, category, classification,
version, target, page/anchor, example, coverage, availability and upstream links.

| Category                      | Entry points |
| ----------------------------- | -----------: |
| MUI renderable components     |          131 |
| Type-only                     |            5 |
| Context/provider              |            1 |
| Other documented MUI subpaths |            6 |
| Constants/style helpers       |            3 |
| Hooks                         |            5 |
| Utility/factory               |            1 |
| Package roots/facades         |            8 |
| Original components           |            3 |
| Total                         |          163 |

The 152 MUI subpaths include 14 enhanced wrappers. Counts are entry points, not all
named TypeScript symbols. Optional lab/icons require separate peers; MUI X is not
included. Root/facade and named API details remain UI-2/UI-4 reference work.
Divider/Button/DataTable have compiled templates; every other entry is a searchable
catalog record explicitly marked reference pending, not a completed component page.
Only Divider/Button guide/API mappings are verified here; other mappings stay null
until UI-2. Source mappings derive from material module specifiers, not guessed
helper/facade URLs. Rolling MUI docs are distinguished from immutable v9.4.0 source.

Dependency order: UI-0 review -> UI-1 acceptance -> UI-2/UI-3. UI-4 requires the
library issue below and a separately authorized tested release. UI-5 requires its
runner ADR/negative tests; UI-6 requires accepted UI-2 through UI-5; UI-7 requires
separate deployment authorization. Canonical stage definitions remain in PR #20.

## Consent assessment

[ui-core #1](https://github.com/CoderLifeNet/ui-core/issues/1), assigned to chrishacia,
owns public API/test changes. Evidence: alpha.2 source
`2ffe4807ddef447fa22deb70b553a84624727cff`, analytics runtime/types, memory adapter,
extensions and tracking boundaries. No private docs runtime patches.

| Observed behavior                                  | Required disposition before UI-4                                       |
| -------------------------------------------------- | ---------------------------------------------------------------------- |
| Default disabled, analytics/ad denied              | Host maps unknown to denied; no built-in unknown state/CMP persistence |
| Dispatch gates global enabled and analyticsStorage | Enforce separate advertising categories per adapter                    |
| configure runs on construction/update while denied | Audit SDK ownership; no generic no-initialization/storage promise      |
| Per-adapter enabled passed to configure            | Central dispatch does not enforce individual adapter disablement       |
| No runtime queue/replay                            | Define in-flight cancellation and adapter-specific cleanup limits      |
| dispose calls adapter disposal                     | Add terminal lifecycle enforcement; later dispatch is not blocked      |
| Metadata primitive-type sanitization               | Add approved field minimization/redaction, not just type checking      |
| Ancestor opt-out wins, supplied handlers work      | Preserve normal behavior through all consent/adapter failures          |

Do not infer GA4/Adobe/Meta cleanup from memory behavior. SDK initialization,
storage, credentials, teardown, HttpOnly/third-party limits, persistence and
multitab restoration remain adapter/host-specific UI-4 work. No planned API is
presented as shipped. The fixture tests deny/grant/revoke/opt-out/reset without
network/storage; it is not a production banner or site-preferences integration.

## Data inventory and trust boundaries

Owner: Chris / CoderLifeNet for every row. No application telemetry collection;
host access logs are a separate, unresolved production responsibility.

| Data                 | Classification/purpose                     | Permission                        | Retention/deletion/export                                              | Abuse control                              |
| -------------------- | ------------------------------------------ | --------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------ |
| Appearance           | Local display preference                   | System or explicit session choice | Memory until reload; system control resets; no stored export           | Fixed enum                                 |
| Site consent         | Not implemented; no optional collection    | Future UI-4 categories            | Versioned persistence/reset requires approval                          | Tracking disabled                          |
| Site telemetry       | Disabled; no SDK                           | No active grant mechanism         | None collected                                                         | No telemetry endpoint                      |
| Host access logs     | Potential IP/URL personal data, operations | Hosting/privacy approval pending  | Production access/retention/deletion/export unresolved; launch blocker | No deployment; no secrets in URLs          |
| Search               | Potential sensitive input, local lookup    | Visitor action                    | Memory until navigation/reload; no logs/export                         | 120 characters; 12 results; escaped text   |
| Example state/events | Deterministic fixtures/counters/row IDs    | Separate demo consent for events  | Reset/unmount/reload clears; explicit source clipboard copy            | Memory adapter only; no typed text payload |
| Edited source        | Absent; reviewed source is public          | Arbitrary editing off             | No snippet collection/storage/upload                                   | No runner/eval/URL execution               |

Locked dependencies enter at build time; authored TSX enters through review and
compilation; browser state/search render as text and bounded controls. Clipboard
writes require a command. No app backend, credentials or platform APIs exist.
Dependency compromise and authored-example defects remain review/build risks.
Main CSP allows self scripts/connections, denies frames/objects and retains inline
styles for MUI/Emotion. Hosting must reapply/review headers. No-network evidence
is not proof of a sandbox: arbitrary execution has not been implemented.

## UI-1 evidence and acceptance

Implemented: nine prerendered routes plus 404; light/dark shell, version-local
search, MUI attribution, reusable templates, raw TSX/copy/reset/error containment,
three fixtures and mobile no-JS navigation. UI-4 persistent privacy controls are
not claimed. [Reproduction commands](site/README.md).

External evidence: `/tmp/coderlifenet-ui-foundation-evidence`, four viewport/theme
screenshot sets and `results.json`. Automated checks cover 1440x1000 and 390x844,
both light/dark; desktop light/dark and mobile dark screenshots were inspected.
Owner visual and manual assistive-technology review remain required.

Build: approximately 160 KB JS gzip / 3.8 KB CSS gzip, under enforced 250 KiB /
45 KiB limits. Vite still reports its advisory 500 KB uncompressed chunk warning;
no editor is bundled. Local unthrottled DOMContentLoaded is below the 5-second
regression budget, not production Web Vitals evidence. UI-6 owns throttled
LCP/INP/CLS, slow-device and deployed transfer/cache measurements.

Site typecheck/build/lint and Chromium tests pass: zero axe WCAG A/AA violations,
document overflow, browser errors, external requests or storage entries across
four primary routes/theme/viewports. Checks cover consent/opt-out/revoke, source/
copy/reset, table states/filter/sort/selection/page/page-size, appearance, keyboard
skip link, search deep links and mobile no-JS text/navigation. Full cross-browser
and UI-5 isolation evidence is not claimed.

Pre-existing root gate: `pnpm lint` crashes loading
`@typescript-eslint/typescript-estree@8.43.0` with TypeScript 7.0.2
(`ModuleKind.Cjs` undefined), before file traversal. Separate site checks do not
waive that root gate; keep the PR draft until tooling and reviews are resolved.
coderlife.net hosted Actions remain disabled and all PRs unmerged. PR #19's
historical waiver is not reused. UI-2 through UI-7 remain pending.

Final security/regression checks on 2026-09-11: frozen `npm ci --ignore-scripts`,
site format/lint/audit passed (zero vulnerabilities). npm 11.11.1 verified 147
registry signatures and 59 attestations. Existing library typecheck, build and
15 tests in four files passed. Root lint limitation above remains unresolved.
All four viewport/theme screenshot sets have now been visually inspected.

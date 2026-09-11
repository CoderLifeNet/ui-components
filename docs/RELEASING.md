# Public alpha release

Protected publication and dry-run now use the same pinned core release inspector
and absolute-tarball-path helper. The helper checks that the `.tgz` exists before
invoking npm, avoiding npm 11's GitHub-shorthand parsing of bare `artifacts/...`.
Real publication still verifies the source/hash record, registry availability,
and published core first, with public access, alpha tagging and provenance.
The path fix supersedes prior source/hash approval records: refresh CI and prepare
artifacts at the new workflow commits before approving new protected runs.

## Prepublication security disposition

The reported high-severity audit result was the demo's direct development
dependency `docs/demo-app -> vite@7.1.3` (also shared by
`@vitejs/plugin-react@5.0.4`). The high-severity upstream advisories are:

- [GHSA-v2wj-q39q-566r](https://github.com/vitejs/vite/security/advisories/GHSA-v2wj-q39q-566r):
  query-based `server.fs.deny` bypass, affected 7.1.0 through 7.3.1; fixed in 7.3.2.
- [GHSA-p9ff-h696-f583](https://github.com/vitejs/vite/security/advisories/GHSA-p9ff-h696-f583):
  arbitrary file read through development-server WebSocket `fetchModule`, affected
  7.0.0 through 7.3.1; fixed in 7.3.2.
- [GHSA-fx2h-pf6j-xcff](https://github.com/vitejs/vite/security/advisories/GHSA-fx2h-pf6j-xcff):
  Windows alternate-path `server.fs.deny` bypass, affected 7.0.0 through 7.3.4;
  fixed in 7.3.5.

These advisories concern reachable Vite development servers and disclosure of
server-side files, with additional Windows/filesystem conditions for the last
advisory. The demo is private and excluded from both package allowlists. Neither
packed library depends on Vite. Acceptance uses production builds and loopback
`vite preview`, not the vulnerable development-server endpoints; the publishing
job does not install or run the demo. The separate Vite 5 consumer compatibility
fixture remains unchanged; this is not a claim that every tooling audit is clean.

The demo now pins compatible Vite 7.3.6. Only Vite and its required esbuild family
changed in its lockfile. `npm ci --ignore-scripts`, production demo build, and
`npm audit --json` passed; the demo lock audit reported zero vulnerabilities,
including the five additional low/moderate Vite advisories in the original report.
Library functionality and runtime dependency versions are unchanged.

This demo-only fix advances components' release source commit and requires a fresh
CI/prepare record. The previous components source approval is superseded even if
the tarball bytes remain identical, because demo files are excluded from packing.
Core's source and artifact approval remain unchanged. Compare each new run's
artifact hashes before approving the protected publishing job.

Bootstrap-secret metadata has now been verified in BOTH npm-alpha environments.
Do not revoke the token or remove either secret until BOTH publications succeed.
Afterwards configure each actual npm package's trusted publisher and verify that
configuration separately; a bootstrap publication is not proof of trusted publishing.

Proposed first publication: `@coderlifenet/ui-components@0.1.0-alpha.2`, public,
dist-tag `alpha` only, with exact peer `@coderlifenet/ui-core@0.1.0-alpha.2`.
Publish and registry-verify core first. This repository never publishes on push.

## Prerequisites and authentication

On 2026-09-10 npm authenticated `chrishacia`; `npm org ls coderlifenet chrishacia
--json` confirmed `owner`, establishing package-creation/publication rights.
Authenticated package and exact 0.1.0-alpha.2 lookups returned 404 for both new names,
with no visible versions or tags. Permission is proven by membership, not by 404s.
Recheck version availability before publication. Local login does not authenticate
Actions; neither npm-alpha environment had NPM_BOOTSTRAP_TOKEN at verification.

All pre-rename artifact hashes and approval records are superseded. They belong
to different package identities and must never be published. Approve only the
new-name tarballs and source/hash reports produced by the final prepare workflows.

Follow [core's release guide](https://github.com/CoderLifeNet/ui-core/blob/main/docs/RELEASING.md)
for first-publication bootstrap and current official npm/GitHub references.
For this package configure npm trusted publishing with organization `CoderLifeNet`,
repository `ui-components`, workflow `publish.yml`, environment `npm-alpha`, and
allow direct `npm publish`. Prefer this tokenless `publish-oidc` mode once package
settings exist. First publication may use `publish-bootstrap` with a short-lived,
scope-limited granular token with package read-write and bypass 2FA, entered directly
as GitHub environment secret `NPM_BOOTSTRAP_TOKEN`. Revoke/delete it after configuring
OIDC. Both modes require provenance. No token has been created by this preparation.

Official npm guidance rechecked on 2026-09-10 still supports bypass-2FA granular
tokens for direct package publication, but not account-governance operations or
staged approval. Limit Packages and scopes read-write to `@coderlifenet`, use a
short expiration and enter the token directly in Settings > Environments >
npm-alpha > NPM_BOOTSTRAP_TOKEN. Organization-management access is unnecessary.
Enable npm account 2FA and complete any account challenges on npm itself. For
later OIDC publishing, explicitly allow direct `npm publish` in trusted-publisher
settings; stage-only permission does not authorize this workflow.

The `npm-alpha` environment must allow only main, require maintainer approval and
disable administrator bypass. Only its publishing job has `id-token: write` and
can access the bootstrap secret. All actions are immutable SHA pins. Node 22.22.3
and npm 11.11.1 support OIDC; runtime dependency versions remain unchanged.

## Artifact preparation

The workflow checks out core at the same immutable commit as acceptance CI, packs
it, binds only local artifact lock integrities, then runs full components acceptance
including Vite/Next browser checks and the external TypeScript fixture. The shared
core `scripts/check-release.mjs` validates the components tarball's metadata,
allowlist, exports, declarations and dependency portability, then dry-runs npm
publication. `pack:local` removes the development-only local tarball dependency
from the packed manifest while preserving the exact registry core peer.

Manually dispatch `publish.yml` with `mode=prepare` and `expected_sha=<full-main-sha>`.
This cannot publish and needs no npm secret. The `npm-alpha-<commit>` Actions
artifact contains the validated tarball and `release.json` with SHA256, SHA512 and
source commit, retained for 30 days. CI-built bytes are the release approval artifact;
do not substitute a locally rebuilt tarball. Dry-run does not prove npm access.

## Manual publication

Only after separate approval, npm access setup, and core registry verification:

```sh
gh workflow run publish.yml --repo CoderLifeNet/ui-components --ref main \
  -f expected_sha=<approved-full-main-sha> -f mode=publish-bootstrap
```

Use `publish-oidc` when trust is configured. Review the fresh validated artifact
and approve the environment job. It re-verifies artifact identity and version
availability and refuses publication unless the exact core version exists with
the correct repository URL. Publication uses `--tag alpha --access public
--provenance`, never latest. Core and components must be approved in that order.

## Post-publication registry smoke checks

For both packages, run `npm view <package>@0.1.0-alpha.2 version dist.integrity
dist.attestations repository --json` and `npm view <package> dist-tags --json`.
Compare registry integrity with the approved workflow report, confirm public
access, alpha points to the intended version, and latest remains absent/unchanged.

From the canonical components checkout after both packages are published, run:

```sh
smoke=$(mktemp -d /tmp/coderlife-registry-smoke-XXXXXX)
git archive HEAD | tar -x -C "$smoke"
cd "$smoke"
for fixture in vite-app next-app external-check; do
  npm pkg set --prefix "consumers/$fixture" \
    'dependencies.@coderlifenet/ui-core=0.1.0-alpha.2' \
    'dependencies.@coderlifenet/ui-components=0.1.0-alpha.2'
  pnpm --dir "consumers/$fixture" install --no-frozen-lockfile --registry=https://registry.npmjs.org/
done
pnpm --dir consumers/vite-app build
pnpm --dir consumers/next-app build
pnpm --dir consumers/external-check typecheck
pnpm --dir consumers/external-check why react
pnpm --dir consumers/external-check why @mui/material
npm pkg delete devDependencies.@coderlifenet/ui-core
pnpm install --no-frozen-lockfile --registry=https://registry.npmjs.org/
pnpm exec playwright install chromium
node scripts/check-consumer-browser.mjs --registry
npm install --prefix consumers/external-check --package-lock-only --ignore-scripts --registry=https://registry.npmjs.org/
npm audit signatures --prefix consumers/external-check
```

This uses source-only temporary fixtures, preserves explicit baseline versions,
and changes only CoderLife inputs to exact registry dependencies. The browser
checker verifies registry SHA512 identities before running the same rendering,
root/subpath, opt-out, consent and disabled-runtime assertions. Confirm one React
19.2.8 and MUI 9.4.0 version in the dependency reports. Remove the temporary smoke
directory after reviewing results. These registry checks cannot pass before publication.
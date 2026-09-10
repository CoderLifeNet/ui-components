# Public alpha release

Proposed first publication: `@coderlife/ui-components@0.1.0-alpha.2`, public,
dist-tag `alpha` only, with exact peer `@coderlife/ui-core@0.1.0-alpha.2`.
Publish and registry-verify core first. This repository never publishes on push.

## Prerequisites and authentication

On 2026-09-10 npm was not authenticated (ENEEDAUTH); neither package was publicly
visible (404). Scope ownership, package-creation rights, and private versions are
unverified. Run `npm login --registry=https://registry.npmjs.org/` yourself, then
`npm whoami` and `npm org ls coderlife <npm-username> --json`. An npm scope owner
must confirm package creation/write permission; GitHub access proves nothing about
npm. Never put credentials in chat. If packages exist, inspect versions/tags and
`npm access list collaborators @coderlife/ui-components --json` before publishing.

Follow [core's release guide](https://github.com/CoderLifeNet/ui-core/blob/main/docs/RELEASING.md)
for first-publication bootstrap and current official npm/GitHub references.
For this package configure npm trusted publishing with organization `CoderLifeNet`,
repository `ui-components`, workflow `publish.yml`, environment `npm-alpha`, and
allow direct `npm publish`. Prefer this tokenless `publish-oidc` mode once package
settings exist. First publication may use `publish-bootstrap` with a short-lived,
scope-limited granular token with package read-write and bypass 2FA, entered directly
as GitHub environment secret `NPM_BOOTSTRAP_TOKEN`. Revoke/delete it after configuring
OIDC. Both modes require provenance. No token has been created by this preparation.

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
    'dependencies.@coderlife/ui-core=0.1.0-alpha.2' \
    'dependencies.@coderlife/ui-components=0.1.0-alpha.2'
  pnpm --dir "consumers/$fixture" install --no-frozen-lockfile --registry=https://registry.npmjs.org/
done
pnpm --dir consumers/vite-app build
pnpm --dir consumers/next-app build
pnpm --dir consumers/external-check typecheck
pnpm --dir consumers/external-check why react
pnpm --dir consumers/external-check why @mui/material
npm pkg delete devDependencies.@coderlife/ui-core
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
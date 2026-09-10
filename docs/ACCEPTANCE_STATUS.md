# Acceptance Status

Date: 2026-09-08

## Scope

Alpha.2 bounded closeout for packaged consumer verification, browser runtime assertions, and external consumer portability.

## Required Gates

- typecheck and tests
- pack local artifact
- consumer install/build gates for Vite and Next
- browser runtime verification with explicit event-count assertions
- external consumer portability fixture check

## Superseded Pre-Rename Artifact Identity

The hashes below describe historical pre-rename packages, not the current scope.
They are not publication candidates. See RELEASING.md and the final prepare run
for new-name artifact identity; the prior release approval is superseded.

The hashes below identify the previous browser verification, not packs containing
the new CI scripts. First-CI source packs remain unpublished alpha.2 and their
actual integrity is recorded by the bootstrap and browser gates.

- Historical components tarball (pre-rename, archival only)
- sha256: 28e83b1d37f806e1a0208817e6dbf0cee15f3991192c66baa73c27e1bb72096f
- sha512-base64: UznaYZLdoytaLrM5naN4THABrs5rfYB5nKcWeNonB/q1rfo5VGIx0c2zx4ciiMEBi4U15soJPjRwSwWBprfe5g==

## Browser Assertion Contract

Each production fixture page must assert:

- root click increments event count
- subpath click increments event count
- boundary opt-out click does not increment event count
- consent revocation blocks subsequent increments
- analytics disablement blocks subsequent increments
- pageerror count is zero
- console error count is zero

## Browser Verification Result (Final Artifacts)

- Browser gate: `node scripts/check-consumer-browser.mjs`
- Artifact identity verified from fixture lockfiles before navigation:
	- Historical core tarball integrity `sha512-MRLWoJcWEgqIeYmDJk2AESEJjsoWhwk/qZpaxa2DoEUJr9TrAiaBk9IxK7TpleMFGzZ6goeK1c6VdD2V2Po54A==`
	- Historical components tarball integrity `sha512-UznaYZLdoytaLrM5naN4THABrs5rfYB5nKcWeNonB/q1rfo5VGIx0c2zx4ciiMEBi4U15soJPjRwSwWBprfe5g==`
- Results:
	- Vite fixture: all assertions pass, pageerror count 0, console error count 0
	- Next fixture: all assertions pass, pageerror count 0, console error count 0

## Historical .next Scan (Commit 2c2ec9e)

- Scope: `consumers/next-app/.next` at commit `2c2ec9e5cf56050dc4a28bedf8dbff4f03d77bd2`
- File count: 172
- Approximate size: 273945.21 KiB
- Scanner used:
	- high-signal credential regex scan via `git grep -E` for common key/token/private-key signatures
	- broad keyword pass for `apiKey|secret|token|password|authorization|bearer` for manual triage
- Findings:
	- high-signal verified credential patterns: 0
	- broad keyword matches: 19 lines across generated chunk/map/manifest artifacts
- Disposition:
	- no verified credentials were detected by this inspection
	- this is not a formal guarantee of secret absence
	- the subsequent authorized first-CI preparation removed only this directory from
		unpublished history using git-filter-repo; current legitimate tracked files were
		byte-identical across filtering and no reachable commit retains the directory

## Authorized History Cleanup

- Original main: `85350d4f5f8ca546486b79eb1d42b4210c78e043`.
- Filtered main before CI changes: `7e337fe43ec5ff58b1520d5331efd1243e6c2f3d`.
- No remotes, remote-tracking refs, tags, or sharing evidence in local reflogs/config.
- Verified full bundle retained outside both repositories in the operator's
	`CoderLifeNet-history-backup-VeLBk4` directory; its RESTORE guide records absolute
	recovery commands, original refs, tree snapshots and commit map. Bundle SHA256:
	`7a3082eb2ee42cfe31d3fe6bb4bef91d448fa15dbaf56c592bc5dbcae2ae7b74`.
- Historical file contents: 172 files / 280519893 bytes (267.525 MiB).
- Actual Git storage: 67492 KiB loose objects before; 122 KiB packed objects after.
	Whole .git allocation: 67612 KiB before, 272 KiB immediately after filtering.
- `git fsck --full` passes; no force-push or remote operation performed.

## First Remote CI Arrangement

- Proposed repositories: `CoderLifeNet/ui-core`, `CoderLifeNet/ui-components`.
- Components workflow checks out itself at `ui-components/` and core at `ui-core/`,
	pinned to `bac9d7f6c0f233a6bd761a27fdecba55516314c3` (never a floating branch).
- Install core using its frozen lock and repository-local workspace permissions;
	validate generated output and pack it before installing components.
- `scripts/prepare-artifacts.mjs --root` binds that tarball's SHA512 to the existing
	root lock. The fixture mode does the same after packing components. Only local
	tarball integrity fields change; registry versions/resolutions remain frozen.
- Packed manifests are checked for portable dependencies. Local file dependencies
	are development/fixture arrangements; pack-local removes local development deps.
- Each consumer has its own workspace boundary and tracked lockfile. Only the two
	unpublished CoderLife packages are excluded from registry release-age queries.
- Node 22 / pnpm 11.2.2; explicit Chromium + Linux dependencies installation; full
	acceptance including Vite, Next and standalone external fixture gates.
- Public core checkout needs no additional secret. Private core requires a read-only
	cross-repository `CORE_READ_TOKEN`; ordinary repo-scoped GITHUB_TOKEN cannot read
	a different private repository. Fork PRs cannot receive this secret.
- Local isolated macOS acceptance passes: core 32/32 tests, components 15/15;
	semantic drift regression cases pass, visual mismatch 0 in all four scenarios,
	bundle overhead +1381/+574 bytes root and +1381/+569 subpath (raw/gzip),
	Vite/Next assertions pass with zero pageerror and console-error events. Remote
	Ubuntu execution remains to be confirmed by the first Actions run.

## Documentation Ownership

- Repository-owned acceptance source for components is this file.
- Workspace root `ACCEPTANCE_MATRIX.md` is outside this repository and is not a versioned source of truth for components release status.

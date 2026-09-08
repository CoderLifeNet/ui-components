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

## Artifact Identity

- ui-components/artifacts/coderlife-ui-components-0.1.0-alpha.2.tgz
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
	- `ui-core/artifacts/coderlife-ui-core-0.1.0-alpha.2.tgz` integrity `sha512-MRLWoJcWEgqIeYmDJk2AESEJjsoWhwk/qZpaxa2DoEUJr9TrAiaBk9IxK7TpleMFGzZ6goeK1c6VdD2V2Po54A==`
	- `ui-components/artifacts/coderlife-ui-components-0.1.0-alpha.2.tgz` integrity `sha512-UznaYZLdoytaLrM5naN4THABrs5rfYB5nKcWeNonB/q1rfo5VGIx0c2zx4ciiMEBi4U15soJPjRwSwWBprfe5g==`
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
	- cleanup of historical committed build output is warranted before public hosting to reduce exposed surface and repository weight, but this pass did not rewrite history

## Documentation Ownership

- Repository-owned acceptance source for components is this file.
- Workspace root `ACCEPTANCE_MATRIX.md` is outside this repository and is not a versioned source of truth for components release status.

# Upgrade plan

## Current state

Score: 5/10 (was 3/10) — builds, typechecks, lints and tests cleanly with CI
and config guard tests, but it is still the upstream scaffold: example
catalog data, guest-only auth, placeholder owner/org.

## Backlog

- P0: Production auth. `app-config.production.yaml` enables only the guest
  provider, which Backstage refuses outside development; add a real provider
  (e.g. GitHub, the module is already a backend dependency) and a sign-in
  resolver before any hosted deploy.
- P1: Replace the example catalog with Solo Empire entities (a `Location`
  pointing at each repo's `catalog-info.yaml`, or a GitHub discovery
  provider) and a real `org.yaml`; set `organization.name` and the owner in
  `catalog-info.yaml` (currently `john@example.com`).
- P1: Replace `permission-backend-module-allow-all-policy` with a minimal
  policy once non-guest users exist.
- P1: Frontend tests for the custom nav module (`modules/nav`).
- P2: Run the Playwright smoke test (`yarn test:e2e`) in CI with a started
  app; trim home-page placeholder widgets (world clock, random joke).
- P2: Set TechDocs `generator.runIn: local` for hosts without Docker.

## Done in this pass

- Fixed `yarn lint`: it diffed against `origin/master`, which does not exist
  (default branch is `main`).
- Added `packages/backend/src/appConfig.test.ts`: loads the real configs with
  `@backstage/config-loader`, checks every catalog file location resolves
  (dev cwd and Docker image root), that production secrets come only from
  env substitution, and that no literal credentials are committed.
- Added GitHub Actions CI: install (immutable), tsc, lint:all, prettier,
  tests, backend build.
- README rewritten from the scaffold text; catalog-info description and
  GitHub slug annotation set.

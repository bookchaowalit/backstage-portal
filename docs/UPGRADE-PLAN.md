# Upgrade plan

## Current state

Score: 6/10 (5 after pass 1, 3 before) — builds, typechecks, lints and tests
cleanly with CI; production now has a real GitHub OAuth sign-in path, but the
catalog is still example data with a placeholder owner/org.

## Backlog

- P0: Before a hosted deploy, add a catalog `User` entity named after the
  owner's GitHub login (the production resolver rejects users without one)
  and register the GitHub OAuth app; secrets come from
  `AUTH_GITHUB_CLIENT_ID` / `AUTH_GITHUB_CLIENT_SECRET`.
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

## Done in this pass (pass 2)

- Production auth: `app-config.production.yaml` sets
  `auth.environment: production` and configures the GitHub provider from
  `${AUTH_GITHUB_CLIENT_ID}` / `${AUTH_GITHUB_CLIENT_SECRET}` with the
  `usernameMatchingUserEntityName` resolver; the backend registers
  `plugin-auth-backend-module-github-provider`. Dev keeps guest.
- Frontend `modules/signIn` replaces the guest-only default sign-in page:
  guest + GitHub in development, GitHub only otherwise.
- Tests: config tests for dev guest, prod GitHub env substitution, no
  catalog-less sign-in fallback, no guest outside development; provider
  selection unit tests and a rendered sign-in page test per environment.
  `backstage-cli config:check --lax` passes for the production config.

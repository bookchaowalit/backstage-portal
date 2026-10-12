# backstage-portal

Backstage developer portal for Solo Empire: a software catalog, scaffolder
templates, TechDocs, and search over the Solo Empire repositories.

It is still close to the upstream scaffold: the catalog loads the example
entities under `examples/`. Sign-in uses the guest provider in development and
GitHub OAuth in production. See `docs/UPGRADE-PLAN.md` for the backlog.

## Requirements

- Node.js 22 or 24
- Yarn 4 (bundled in `.yarn/releases`; run `corepack enable`)

## Run locally

```sh
yarn install --immutable
yarn start            # app on :3000, backend on :7007 (SQLite in memory)
```

`GITHUB_TOKEN` is read from the environment for the GitHub integration; never
commit it. Production config (`app-config.production.yaml`) expects
`POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_USER`, and `POSTGRES_PASSWORD`
from the runtime environment.

### Sign-in

- Development (`yarn start`): the sign-in page offers Guest and GitHub; guest
  needs no setup. GitHub is only initialized when `auth.providers.github` is
  configured.
- Production (`app-config.production.yaml`): `auth.environment: production`,
  the sign-in page offers only GitHub, and the backend guest provider refuses
  to authenticate. Create a GitHub OAuth app with callback
  `<backend.baseUrl>/api/auth/github/handler/frame` and provide
  `AUTH_GITHUB_CLIENT_ID` and `AUTH_GITHUB_CLIENT_SECRET` from the runtime
  secret store (never commit them). The `usernameMatchingUserEntityName`
  resolver requires a catalog `User` entity whose name equals the GitHub
  login; users without one are rejected.

## Verify

```sh
yarn tsc
yarn lint:all
yarn prettier:check
yarn test             # includes config tests in packages/backend
yarn build:backend
```

`yarn test:e2e` runs the Playwright smoke test and starts the dev server
itself when `CI` is unset.

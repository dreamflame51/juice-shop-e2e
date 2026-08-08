# Juice Shop E2E

Playwright + TypeScript end-to-end automation against [OWASP Juice
Shop](https://owasp.org/www-project-juice-shop/) — UI, API and load coverage,
reported through Allure 3 and gated in GitHub Actions.

## Stack

| Concern    | Tool                                        |
| ---------- | ------------------------------------------- |
| UI + API   | Playwright (TypeScript)                     |
| Load       | k6                                          |
| SUT        | Docker Compose (`bkimminich/juice-shop`)    |
| Reporting  | Allure 3 (`allure-playwright`, no JRE)      |
| CI         | GitHub Actions                              |

## Getting started

```bash
npm ci
npx playwright install --with-deps chromium

cp .env.example .env      # then fill in TEST_USER_PASSWORD
npm run sut:up            # start Juice Shop, wait for healthy
npm test
```

`.env` is the single source of truth for the base URL, the SUT port and the
test-user password — `docker-compose.yml` and the Playwright config both read
it. Nothing environment-specific is hardcoded in source.

## Scripts

| Script                     | What it does                                    |
| -------------------------- | ----------------------------------------------- |
| `npm run sut:up` / `:down` | Start / tear down the Dockerized Juice Shop      |
| `npm test`                 | Full Playwright suite (UI + API)                 |
| `npm run test:smoke`       | `@smoke` subset — the PR gate                    |
| `npm run test:ui` / `:api` | One layer at a time                              |
| `npm run perf`             | k6 checkout load scenario                        |
| `npm run allure:generate`  | Build the Allure report into `allure-report/`    |
| `npm run allure:open`      | Serve the generated report                       |
| `npm run lint`             | ESLint (bans `waitForTimeout`)                   |
| `npm run type-check`       | `tsc --noEmit`                                   |

## Layout

```
src/
  api/        typed Juice Shop REST client
  data/       faker-based factories — unique data per test
  fixtures/   authedPage, api, registeredUser, session, page objects
  pages/      POM — locators and actions only, zero assertions
  utils/      env config loader, wait strategies
tests/
  ui/{auth,basket}/
  api/{auth,basket}/
  perf/       k6 scripts (run outside the Playwright runner)
```

Specs assert, page objects locate, fixtures set up. Every test builds its own
user through the API, so the suite runs fully parallel without collisions.

## Reporting

Every spec is tagged with an `epic` (domain) and a `category`
(`functional` | `security` | `perf-relevant`), so the Allure report groups by
both. Trend and flaky history live in `allure-history/history.jsonl`, restored
from and saved to the GitHub Actions cache on every nightly run.

## Performance

`tests/perf/checkout.js` drives the stateful write path — register → login →
add to basket → checkout — ramping to 10 VUs over two minutes with think time
between steps. It runs nightly only, against the Dockerized SUT, and its k6
summary is published as the `k6-summary` CI artifact.

**Baseline** (local, Dockerized SUT, 180 iterations, 0 failures):

| Metric                       | p95    |
| ---------------------------- | ------ |
| `http_req_duration`          | ~42 ms |
| `checkout_duration`          | ~50 ms |

**Gates** — `http_req_failed < 1%`, `http_req_duration p95 < 250ms`,
`checkout_duration p95 < 300ms`, `checks > 99%`. These sit ~5x above the
measured baseline: loose enough for a slower CI runner, tight enough to catch a
real regression. Recalibrate once CI produces its own baseline.

### Stock is a load-test constraint

Juice Shop stocks a finite quantity per product and rejects orders with a `400`
once a SKU runs out. The scenario therefore reads `/api/Quantitys` in `setup()`
and only targets products with at least 20 units, spreading orders across the
catalogue. Without this the run drains its own inventory and ends up measuring
the error path instead of checkout. This is also why the perf job starts a
fresh SUT — a reused instance carries depleted stock from the previous run.

## CI

- **PR** — lint, typecheck, `@smoke` suite. Fast gate.
- **Nightly** — full suite sharded 4 ways, Allure report published to GitHub
  Pages, k6 load run with its summary archived.

`TEST_USER_PASSWORD` is supplied as a repository secret; no credentials live in
the repo.

## A note on the failing security test

`tests/api/auth/login.spec.ts` contains a login SQL-injection check marked
`test.fail()`. Juice Shop is deliberately vulnerable, so the test documents the
*expected secure* behaviour and is expected to fail against this SUT — if it
ever starts passing, the vulnerability has been fixed and the annotation should
be removed.

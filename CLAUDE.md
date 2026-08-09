# Project: Juice Shop E2E Automation

Playwright + TypeScript test automation framework targeting OWASP Juice Shop
(UI, API, and perf coverage). Portfolio project — built to production standards.

## Stack
- Playwright (TS) — UI + API (`request` fixture)
- k6 — perf/load (run outside the Playwright test runner)
- Docker Compose — SUT (Juice Shop) + environment
- Allure3 — reporting (`allure-playwright`, `allure-js-commons`)
- GitHub Actions — CI

## Clean Code Principles (non-negotiable)
- **KISS** — no abstraction until there's a second real use case for it
- **DRY** — shared logic lives in fixtures/utils, never copy-pasted across specs
- **SRP** — page objects contain locators/actions only, no assertions; fixtures
  handle setup/teardown only; specs handle assertions/orchestration only
- **YAGNI** — don't build config/flags/options for scenarios that don't exist yet
- Every function/class has one clear reason to change
- Prefer composition (fixtures) over inheritance for shared behavior

## Directory Structure
```
src/
  fixtures/     custom fixtures — authedPage, apiClient, testUser, etc.
  pages/        POM — one class per page/component, zero assertions
  api/          typed API client wrappers
  data/         factories/builders (faker-based) — no static JSON fixtures
  utils/        retry, wait strategies, env config loader
tests/
  ui/{domain}/
  api/{domain}/
  perf/         k6 scripts
```

## Secrets & Config — HARD RULE
- **No secrets, credentials, or environment URLs hardcoded anywhere in source.**
- All environment-specific values (base URL, test user creds, ports) come from
  `.env`, loaded via `src/utils/config.ts`.
- `.env` is gitignored. `.env.example` is committed with placeholder keys only.
- Docker Compose reads the same `.env` — one source of truth, no duplication.

## Test Data
- Factories only (faker-based), generated per test/worker.
- No shared static fixtures — every worker gets isolated test users/data to
  keep parallel runs safe.

## Reporting (Allure3)
- Reporter: `allure-playwright`, results → `allure-results/`
- No JRE dependency — Allure3's generator is Node-native
- Every spec must:
  - Tag domain via `allure.epic(<domain>)`
  - Tag category via `allure.label('category', 'Functional'|'Security'|'Performance')`
  - Use `allure.step()` for multi-step actions, not bare comments
- CI: merge `allure-results` across shards before generating HTML
- CI: restore/cache `allure-results/history/` before generation, persist after
  — required for trend/flaky-history view, set up from the first run
- Pin the allure3 version explicitly in `package.json`

## CI
- PR trigger: lint, typecheck, smoke suite (fast subset)
- Nightly trigger: full suite, sharded + parallel, Allure HTML report published

## Definition of Done (for any new spec)
- Typed, uses existing fixtures — no ad hoc setup inline
- No hardcoded waits (`waitForTimeout` is a smell, not a solution)
- No hardcoded URLs/secrets — pulled from config
- Tagged by domain (epic) and category per Reporting section
- Reuses an existing page object/fixture if one exists — don't duplicate
- Added (or updated) as a row in `docs/test-catalog.md` — see below

## Test Catalog — HARD RULE
`docs/test-catalog.md` is the single source of truth for every spec/scenario
in the suite: what it covers, its steps, and its layer/category. Any time a
spec is added, removed, or its scenario changes (new test case, changed
steps, changed category), update the catalog in the same change — do not
leave it for a follow-up. This applies whether the spec was written by hand
or generated. Stale rows are worse than no catalog.
- Each test row must name the fixtures used for setup *before* the test's
  first step (e.g. `authedPage` registers + logs in a user via the API,
  `registeredUser` registers but doesn't authenticate) — not just the steps
  the test body performs. This makes it clear at a glance whether a test
  drives auth/setup through the UI or starts from already-seeded state.

## Performance (k6)
- Scenario: login → add-to-basket → checkout under load (stateful writes, not
  product-list reads — reads prove nothing interesting).
- Thresholds are pass/fail gates in the script (`http_req_duration` p95,
  `http_req_failed` rate). A perf test that can't fail isn't a test.
- Lives in `tests/perf/`, invoked outside the Playwright runner.
- Runs on the nightly trigger only — never on PRs (slow, noisy, wrong fit for a
  fast gate).
- Runs against the Dockerized SUT, never a shared/public instance — reproducible
  numbers, owned environment.
- k6 native summary exported as a CI artifact; link it from the README.
- One well-designed scenario done properly beats five shallow ones. Don't expand
  until the first tells a complete story: baseline → threshold → breach response.

## Skills
`@playwright/cli` is installed as a devDependency and its skill is vendored
into `.claude/skills/playwright-cli/` (copied from
`node_modules/@playwright/cli`, since `node_modules` is gitignored). It gives
Claude Code browser automation (open/click/fill/snapshot/network mocking/
tracing/test generation) against the Dockerized SUT — use it for exploratory
UI work, debugging failing specs, and generating locators, not as a
replacement for committed Playwright specs. Run commands via
`npx playwright-cli ...`. Re-run the copy step after bumping the
`@playwright/cli` version so the skill content stays in sync.

No other custom Claude Code skills yet. Additional project-specific skills
(domain mapping, scenario planning, spec generation, spec healing) may be
added later as the project matures.

## Keeping the README current
Whenever a change touches CI workflows, reporting/Allure categories or
history handling, the perf/k6 pipeline, directory layout, or scripts —
re-check `README.md` (and `docs/healed-tests/README.md` if relevant) for
drift before considering the task done. Stale examples (wrong category
names, wrong artifact-vs-published-report claims, wrong paths) are worse than
no docs.
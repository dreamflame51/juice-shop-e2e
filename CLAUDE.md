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
Not defining custom Claude Code skills yet — using playwright-cli's built-in
skills for now. Additional project-specific skills (domain mapping, scenario
planning, spec generation, spec healing) may be added later as the project
matures.
# Test Catalog

Tracks every spec/scenario in the suite: what it covers, the steps, and the
layer/category it's tagged with in Allure. Update this file whenever a spec
is added, removed, or its scenario changes — see the "Keeping this catalog
current" rule in [CLAUDE.md](../CLAUDE.md).

Legend: **Layer** = UI / API / Perf (Allure `parentSuite`, derived from path).
**Category** = Allure `category` label (Functional / Security / Performance).

## UI

### `tests/ui/auth/login.spec.ts` — Login
Epic: `UI: Authentication`

| Test | Category | Steps |
|---|---|---|
| `@smoke` A registered user can log in | Functional | Register user via API fixture → open login page → submit valid credentials → assert redirect to `#/search` and account nav visible |
| Rejects a wrong password without revealing whether the account exists | Security | Register user → log in with correct email + wrong password → assert generic "invalid email or password" error |
| Rejects an unknown account with the same generic error | Security | Log in with a never-registered email → assert the same generic error as above |

### `tests/ui/auth/registration.spec.ts` — Registration
Epic: `UI: Authentication`

| Test | Category | Steps |
|---|---|---|
| `@smoke` A new customer can register and then log in | Functional | Open registration page → register a fresh factory-built user → assert redirect to `#/login` → log in with the same credentials → assert redirect to `#/search` |
| Blocks submission when the repeated password does not match | Functional | Fill email/password with a mismatched repeat password → assert submit button stays disabled |

### `tests/ui/basket/add-to-basket.spec.ts` — Basket
Epic: `UI: Shopping`

| Test | Category | Steps |
|---|---|---|
| `@smoke` An authenticated user can add a product to the basket | Functional | Open products page (authed) → add product from catalogue → assert snackbar confirmation → open basket → assert row/quantity/checkout button state |
| Basket seeded through the API is reflected in the UI | Functional | Seed 2 units via `api.addToBasket` → open basket UI → assert quantity reflects the API-seeded state |

### `tests/ui/basket/checkout.spec.ts` — Checkout
Epic: `UI: Shopping`

| Test | Category | Steps |
|---|---|---|
| `@smoke` A user can complete checkout end to end | Functional | Seed address + card via API → add product via UI → open basket → go to checkout → select address → select delivery method → select payment → place order → assert confirmation heading and `#/order-completion/<id>` URL |

## API

### `tests/api/auth/login.spec.ts` — Auth API
Epic: `API: Authentication`

| Test | Category | Steps |
|---|---|---|
| `@smoke` Issues a JWT and a basket id for valid credentials | Functional | Register user via API → `POST /rest/user/login` with valid credentials → assert 200, JWT shape, basket id present |
| Rejects a wrong password with 401 and no token | Security | `POST /rest/user/login` with wrong password → assert 401 and no token leaked in the body |
| Is not bypassable via SQL injection in the email field | Security | `POST /rest/user/login` with a SQLi payload in the email field → asserts 401 (documents expected-secure behaviour; `test.fail()` since the known-vulnerable SUT actually returns 200) |

### `tests/api/basket/checkout.spec.ts` — Checkout API
Epic: `API: Shopping`

| Test | Category | Steps |
|---|---|---|
| `@smoke` Completes an order end to end and returns a confirmation | Performance | Add product to basket via API → create address + card → `POST checkout` → assert confirmation id format |
| Empties the basket once the order is placed | Functional | Add product → create address + card → check out → assert basket is empty afterward |

## Perf (k6)

### `tests/perf/checkout.js`
Nightly only, run outside the Playwright runner against the Dockerized SUT.

| Scenario | Steps | Thresholds |
|---|---|---|
| Stateful checkout under ramping load (0→10→0 VUs over ~2m) | Register → login → think time → add to basket (spread across in-stock SKUs) → think time → create address + card → checkout → record `checkout_duration` | `http_req_failed` rate < 1%, `http_req_duration` p95 < 250ms, `checkout_duration` p95 < 300ms, checks rate > 99% |

## Coverage gaps / candidate scenarios

Not yet implemented — see conversation history for full rationale:

- Basket isolation / tampering (API, Security) — a forged `basketId` from
  another user must not be readable or checkout-able.
- Product search filtering + no-results state (UI, Functional).
- Concurrent basket writes don't lose items (API, race-condition check).

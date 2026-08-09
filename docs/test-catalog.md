# Test Catalog

Tracks every spec/scenario in the suite: what it covers, the fixtures it
relies on, the steps, and the layer/category it's tagged with in Allure.
Update this file whenever a spec is added, removed, or its scenario changes
— see the "Test Catalog — HARD RULE" in [CLAUDE.md](../CLAUDE.md).

Legend: **Layer** = UI / API / Perf (Allure `parentSuite`, derived from path).
**Category** = Allure `category` label (Functional / Security / Performance).
**Fixtures** = setup that already happened before the test's first step (see
[src/fixtures/test.ts](../src/fixtures/test.ts)) — called out explicitly so
it's clear a test starts pre-authenticated/pre-seeded rather than driving
that state through the UI itself.

## UI

### `tests/ui/auth/login.spec.ts` — Login
Epic: `UI: Authentication`

| Test | Category | Fixtures | Steps |
|---|---|---|---|
| `@smoke` A registered user can log in | Functional | `registeredUser` (API-registers a fresh user before the test starts) | Open login page → submit `registeredUser`'s valid credentials → assert redirect to `#/search` and account nav visible |
| Rejects invalid credentials without revealing whether the account exists | Security | `registeredUser` (API-registered); a second, wholly unregistered user is built inline with `buildUser()` for the second case | Two `allure.step`s sharing the same assertion, so the messages can't silently diverge: (1) log in with `registeredUser`'s email + wrong password → assert generic "invalid email or password" error; (2) log in with a never-registered email → assert the identical generic error |

### `tests/ui/auth/registration.spec.ts` — Registration
Epic: `UI: Authentication`

| Test | Category | Fixtures | Steps |
|---|---|---|---|
| `@smoke` A new customer can register and then log in | Functional | `testUser` (factory-built, **not** registered — registration itself is under test) | Open registration page → register `testUser` through the UI form → assert redirect to `#/login` → log in with the same credentials → assert redirect to `#/search` |
| Blocks submission when the repeated password does not match | Functional | `testUser` (factory-built) | Fill email/password with a mismatched repeat password → assert submit button stays disabled |

### `tests/ui/basket/add-to-basket.spec.ts` — Basket
Epic: `UI: Shopping`

| Test | Category | Fixtures | Steps |
|---|---|---|---|
| `@smoke` An authenticated user can add a product to the basket | Functional | `authedPage` (registers + logs in a user via the API, injects the session token, no UI login) | Open products page → add product from catalogue → assert snackbar confirmation → open basket → assert row/quantity/checkout button state |
| Basket seeded through the API is reflected in the UI | Functional | `authedPage`; `api` + `session` used mid-test to seed the basket | Seed 2 units via `api.addToBasket(session.basketId, ...)` → open basket UI → assert quantity reflects the API-seeded state |

### `tests/ui/basket/checkout.spec.ts` — Checkout
Epic: `UI: Shopping`

| Test | Category | Fixtures | Steps |
|---|---|---|---|
| `@smoke` A user can complete checkout end to end | Functional | `authedPage` (registers + logs in a user via the API, no UI login); `api` used mid-test to seed address/card | Seed a delivery address + payment card via `api.createAddress`/`api.createCard` → add product via UI → open basket → go to checkout → select address → select delivery method → select payment → place order → assert confirmation heading and `#/order-completion/<id>` URL |

### `tests/ui/products/search.spec.ts` — Product search
Epic: `UI: Shopping`

| Test | Category | Fixtures | Steps |
|---|---|---|---|
| `@smoke` Returns only products matching the search term | Functional | None — anonymous catalogue browsing, no auth needed | Open the catalogue → search "apple" via `productsPage.search()` → assert exactly 2 results, matching "Apple Juice" and "Apple Pomace" |
| Shows a no-results state for a term that matches nothing | Functional | None | Open the catalogue → search a nonsense term → assert the "No results found" message is visible |

## API

### `tests/api/auth/login.spec.ts` — Auth API
Epic: `API: Authentication`

| Test | Category | Fixtures | Steps |
|---|---|---|---|
| `@smoke` Issues a JWT and a basket id for valid credentials | Functional | `registeredUser` (API-registered) | `POST /rest/user/login` with valid credentials → assert 200, JWT shape, basket id present |
| Rejects a wrong password with 401 and no token | Security | `registeredUser` (API-registered) | `POST /rest/user/login` with wrong password → assert 401 and no token leaked in the body |
| Is not bypassable via SQL injection in the email field | Security | `api` (no user needed — payload targets the email field itself) | `POST /rest/user/login` with a SQLi payload in the email field → asserts 401 (documents expected-secure behaviour; `test.fail()` since the known-vulnerable SUT actually returns 200) |

### `tests/api/basket/checkout.spec.ts` — Checkout API
Epic: `API: Shopping`

| Test | Category | Fixtures | Steps |
|---|---|---|---|
| `@smoke` Completes an order end to end and returns a confirmation | Performance | `api` + `session` (registers + logs in a user, authenticates the `api` client) | Add product to basket via `api.addToBasket` → create address + card → `POST checkout` → assert confirmation id format |
| Empties the basket once the order is placed | Functional | `api` + `session` | Add product → create address + card → check out → assert basket is empty afterward |

### `tests/api/basket/isolation.spec.ts` — Basket isolation between users
Epic: `API: Shopping`

| Test | Category | Fixtures | Steps |
|---|---|---|---|
| Rejects adding items to another user's basket | Security | `session` (victim, API-registered + logged in); an attacker client is built inline via `new JuiceShopClient(request)` and its own `register`+`login` | Attacker calls `addToBasketRaw` against the victim's `basketId` → assert `401` |
| Does not let another user read a victim's basket contents | Security | `api` + `session` (victim); attacker client built inline | Victim adds an item to their own basket → attacker calls `getBasketRaw` against the victim's `basketId` → asserts `403` (documents expected-secure behaviour; `test.fail()` since the known-vulnerable SUT returns `200` with the victim's basket — missing ownership check on `GET /rest/basket/:id`) |
| Does not let another user check out a victim's basket | Security | `api` + `session` (victim); attacker client built inline, creates its own address/card | Victim adds an item to their own basket → attacker calls `checkoutRaw` against the victim's `basketId` with the attacker's own address/card → asserts `403` (documents expected-secure behaviour; `test.fail()` since the known-vulnerable SUT returns `200` and completes the order against the victim's basket — missing ownership check on `POST /rest/basket/:id/checkout`) |

### `tests/api/basket/concurrency.spec.ts` — Basket concurrency
Epic: `API: Shopping`

| Test | Category | Fixtures | Steps |
|---|---|---|---|
| `@smoke` Concurrent adds of the same product are not lost | Functional | `api` + `session` | Fire 5 concurrent `addToBasketRaw` calls for the same product/basket via `Promise.all` → asserts all 5 return `200` and the final basket quantity sums to 5 (documents expected-correct behaviour; `test.fail()` since the SUT races on the "does a BasketItem for this product already exist" check — only 1 of 5 concurrent requests succeeds, the other 4 return `500`, final quantity is 1 not 5) |

## Perf (k6)

### `tests/perf/checkout.js`
Nightly only, run outside the Playwright runner against the Dockerized SUT.

| Scenario | Steps | Thresholds |
|---|---|---|
| Stateful checkout under ramping load (0→10→0 VUs over ~2m) | Register → login → think time → add to basket (spread across in-stock SKUs) → think time → create address + card → checkout → record `checkout_duration` | `http_req_failed` rate < 1%, `http_req_duration` p95 < 250ms, `checkout_duration` p95 < 300ms, checks rate > 99% |


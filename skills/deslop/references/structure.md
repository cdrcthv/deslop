# Structure — patterns by stack

Always follow the project's existing layout first. Use these when the project
has none, or when a folder has grown past ~15 files and needs splitting.

Core idea everywhere: **group by feature, then by type inside the feature.**
A reviewer looking for "VAT stuff" opens one folder, not five.

## The problem pattern

```
handlers/            ← 40 files, no grouping
  auth_handler.go
  cart_handler.go
  cart_items_handler.go
  vat_handler.go
  invoice_handler.go
  invoice_pdf_handler.go
  ...
```

## Go (backend)

```
cmd/server/main.go
internal/
  billing/
    vat/
      handler.go       # HTTP only: parse request, call service, write response
      service.go       # business logic
      vies_client.go   # external API
      service_test.go
    invoice/
      handler.go
      pdf.go
  cart/
    handler.go
    service.go
    store.go           # database access
  platform/            # shared infrastructure
    db/
    httpx/             # shared HTTP helpers (errors, JSON)
  format/              # shared small helpers: money.go, date.go
```

## Vue / React / TypeScript (frontend)

```
src/
  features/
    checkout/
      CheckoutPage.vue
      VatNotice.vue
      useCheckout.ts       # composable/hook: state + logic
      checkoutApi.ts       # API calls for this feature
    cart/
      CartDrawer.vue
      CartItem.vue
      useCart.ts
  components/ui/           # generic, reusable: Button, Modal, Input
  lib/                     # shared helpers: money.ts, dates.ts, http.ts
  stores/                  # global state only (auth, settings)
  router/
```

Keep components presentational where possible; put logic in the composable/hook.
A component file over ~250 lines usually hides 2–3 components.

## C# / .NET

```
src/Shop.Api/
  Features/
    Billing/
      Vat/
        VatEndpoint.cs
        VatService.cs
        ViesClient.cs
    Cart/
      CartEndpoint.cs
      CartService.cs
  Shared/
    Money.cs
    Results.cs
  Program.cs
tests/Shop.Api.Tests/Features/Billing/Vat/VatServiceTests.cs
```

One public class per file, file named after the class.

## Python

```
app/
  billing/
    vat/
      routes.py
      service.py
      vies_client.py
  cart/
    routes.py
    service.py
    repository.py
  common/
    money.py
    dates.py
tests/billing/vat/test_service.py
```

## Infra / IaC

```
infra/
  modules/            # reusable: one module per concern
    postgres/
    ingress/
  envs/
    prod/
    staging/
k8s/
  apps/<app-name>/    # one folder per app: deployment, service, ingress
```

## Shared helpers: where and how

- One file per topic: `money`, `dates`, `strings`, `http`. Never a single
  1000-line `utils` file.
- Helpers are pure and parameterized (locale, currency, precision as args).
- If only one feature uses it, keep it inside that feature's folder. Move it
  to the shared folder the moment a second feature needs it.

## Size guidelines (soft limits)

| Thing            | Aim for       | Action when exceeded              |
|------------------|---------------|-----------------------------------|
| Function         | < ~40 lines   | Extract named steps               |
| File             | < ~300 lines  | Split by responsibility           |
| Folder           | < ~10–15 files| Sub-folders by feature            |
| Change / PR      | < ~300 lines  | Split into sequential steps       |
| Function params  | ≤ ~4          | Pass an options object/struct     |
| Nesting depth    | ≤ ~3 levels   | Early returns, extract functions  |

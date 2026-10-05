# Monetary contract

This is the canonical contract for money across EasyStore. The client's
implementation guide is `easystore-client/docs/MONETARY-CONTRACT.md`; it must not
contradict this file.

## Decision

Monetary values are `Money` values containing an exact decimal `amount` and a
validated ISO 4217 `currency`. The shared `Currency` value object is the system-wide
source of truth for supported codes. The GraphQL API exposes the amount with the
`Decimal` scalar, which serializes to a canonical JSON string.

EasyStore targets the Americas, with possible later expansion to Europe. Every
supported currency has two minor-unit digits, so the whole system uses one fixed
monetary scale of 2. There is no per-currency scale table.

## Representation

- **Scale.** A `Money.amount` has at most 2 fractional digits. Input with more digits
  is rejected with a validation error; it is never rounded silently.
- **Normalization.** Decimal strings contain no exponent notation or `+` sign. They
  are normalized by removing leading integer zeros, trailing fractional zeros, and
  negative zero (`"12.50"` is transported as `"12.5"`). Display formatting, not
  transport, shows two decimals.
- **Storage.** PostgreSQL monetary columns remain `numeric`/`decimal` (`numeric(19, 2)`
  for `Money`). Aggregation occurs in PostgreSQL and is read as Prisma Decimal values.
- **Non-money decimals.** Rates, percentages, and other ratios (tax rate, discount
  rate, interest rate) are not `Money`. They use their own typed fields with explicit
  validation and may carry more than 2 fractional digits.
- **No floating point.** Server code must not convert monetary amounts to JavaScript
  `number` or GraphQL `Float`. This includes intermediate calculations.

## Supported currencies

EasyStore currently supports **GTQ** and **USD**. The `CurrencyCodes` enum in
`currency.vo.ts` is the single source of truth: the Prisma `Currency` enum, the GraphQL
`CurrencyCodes` enum, and the client's currency select all derive from it, and a test
(`currency.vo.spec.ts`) fails when the value object, the Prisma enum, `schema.gql`, or
the latest migration disagree.

### Adding a currency

A currency is eligible when all of the following hold:

1. It is an active ISO 4217 currency in circulation (not withdrawn or replaced).
2. It is a real currency, not a fund, unit of account, precious metal, or test code.
3. It can be priced at scale 2. Currencies whose ISO 4217 exponent is not 2 (for example
   `JPY`, `KWD`) are not eligible. `CLP` and `PYG` (exponent 0) are accepted on purpose
   and are priced and stored with 2 decimals like every other currency.

Steps, in one change, so backend and client stay in sync:

1. Add the code to `CurrencyCodes` in `currency.vo.ts` and to the Prisma `Currency`
   enum.
2. Add a migration that runs `ALTER TYPE "tenant"."Currency" ADD VALUE '<CODE>'`.
3. Add the code to the `CurrencyCodes` enum in `schema.gql` (it regenerates on boot).
4. Run `npm run gql` in the client. The client lists currencies from the generated enum,
   so no client code change is needed. Add a code-specific story or test only if its
   display needs one.

Removing a currency requires migrating every store, product, and order that uses it
first; it is not a routine operation.

## Rounding and arithmetic

- **Mode.** Round half away from zero (half-up on magnitude). It is the only rounding
  mode in the system.
- **Where.** Intermediate results keep full precision. Round once to scale 2 when a
  value becomes a line total, tax amount, discount amount, or order total.
- **Totals.** Round each line, then sum the rounded lines, so a receipt always adds up.
- **Allocation.** When splitting an amount across lines or parts, compute each share
  at scale 2 and assign the remainder one minor unit at a time, largest fractional
  share first, ties broken by line order. The parts must sum exactly to the original.
- **Where it runs.** Sums and filters may run in PostgreSQL. Rounding, allocation, tax,
  and discount rules run in the domain layer using one exact-decimal implementation.
- **Shared vectors.** Rounding and allocation rules are covered by a shared set of
  test vectors (input, expected output) that the backend and client both execute.

## Currency rules

- **One currency per aggregate.** A cart, order, or payment has exactly one currency.
  Any operation that combines two `Money` values (sum, subtract, compare, allocate)
  throws on a currency mismatch. It never coerces or ignores the mismatch.
- **Store currency.** A store has a configured currency that the tenant can change at
  any time. It is the default for new variant prices and the currency of new orders.
  Changing it does not reprice or restrict existing variants.
- **Product currency.** Currency lives on the product. Every variant of a product is
  priced in the product's currency; variants never carry their own. The tenant picks the
  currency when creating the product (typically the store currency) and may change it
  later, which reprices all of its variants into the new currency (amounts are kept,
  not converted). A variant input carries only an amount.
- **Cart currency.** The first item added to a cart sets its currency. Adding a variant
  whose product currency differs from the items already in the cart is rejected; an
  empty cart accepts any currency. Checkout rejects a line whose currency differs from
  the order's.
- **Immutability after orders.** The only restriction on changing a currency is this:
  the currency of an existing product cannot be changed if any order contains one of its
  variants in that currency. Create a new product, or archive the old one, instead.
  Order lines snapshot price and currency and never change.
- **Dashboard.** Every dashboard monetary value uses the authenticated tenant's
  configured currency. Dashboard aggregation assumes that all tenant orders are
  already denominated in that currency.

## Server authority

- A client never submits a total, tax, or discount amount as truth. It sends ids and
  quantities; the server prices everything from stored data.
- Persist the computed line totals, currency, and rounding inputs on the order. Do not
  recompute historical orders with newer rules.
- A value computed by a client is a preview. The server's value always wins.

## Compatibility

Clients must read `amount` and `currency`; they must treat `amount` as a Decimal
string. Clients should use an exact decimal library for calculations and
`Intl.NumberFormat` for display; a JavaScript `number` is not a valid monetary
transport or calculation type.

## Enforcement status

Enforced in the backend:

- Supported-currency set (GTQ, USD): `currency.vo.ts`, the Prisma `Currency` enum, and
  `schema.gql`, kept in sync by a test. Migration `20261005061305_monetary_contract`
  aborts if any store or variant uses another currency.
- Scale 2: `Money.create` rejects more than 2 decimals; money columns are
  `numeric(19, 2)` (`Variant.price`, `Order.totalAmount`, `OrderDetail.unitPrice` and
  `subtotal`, `Return.refundAmount`, `Payment.amount`, `Plan.price`,
  `Promotion.actionValue`). The migration aborts rather than rounding existing data.
- Rounding and allocation: `Money.roundAmount` and `Money.allocateAmount`, covered by
  the shared vectors in `docs/monetary-test-vectors.json`. Dashboard aggregates are
  rounded once in `DashboardMapper.money`.
- Currency match: `Money.add`, `subtract`, and `compareTo` throw
  `CurrencyMismatchError`.
- Order currency: `Order.currency` is non-null and backfilled from the store.
- Product currency: stored on `Product.currency` (`Variant.currency` was dropped).
  `Product` prices all variants in it, and the migration aborts if an existing product
  has variants in different currencies. Variant inputs take only a `Decimal` amount, the
  domain `Variant` holds a currency-less `MoneyAmount`, and the GraphQL `Variant.price`
  `Money` is built from the product's currency. Cross-context variant lookups expose it
  as `productCurrency` (`VariantDetailsDTO`); the cart compares that value.
- Product currency lock: the product repository rejects changing a product's currency
  inside the update transaction when an order contains one of its variants in the
  current currency (`PRODUCT_CURRENCY_LOCKED`, surfaced as `CONFLICT`).
- Cart currency: adding a variant to a cart is rejected when its product currency
  differs from the currency of the items already in the cart.

Not enforced yet because the code does not exist yet:

- Order and checkout creation must snapshot `Order.currency`, price lines from stored
  data, reject lines whose currency differs from the order, and round per line.
- `Plan.price` and `Promotion.actionValue` use scale 2 but have no currency column; a
  plan price is implicitly in the platform's currency and a promotion value may be a
  percentage, so neither is a `Money` value until it gains a currency.

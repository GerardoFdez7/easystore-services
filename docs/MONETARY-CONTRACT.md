# Monetary contract

## Decision

Monetary values are represented as `Money` values containing an exact
decimal `amount` and a validated ISO 4217 `currency`. The shared `Currency` value
object is the system-wide source of truth for supported codes. The GraphQL API exposes
the amount with the `Decimal` scalar, which serializes to a canonical JSON string.

## Rules

- PostgreSQL monetary source columns remain `numeric`/`decimal`; aggregation occurs
  in PostgreSQL and is read as Prisma Decimal values.
- Server code must not convert monetary amounts to JavaScript `number` or GraphQL
  `Float`.
- Decimal strings contain no exponent notation or `+` sign. They are normalized by
  removing leading integer zeros, trailing fractional zeros, and negative zero.
- Every dashboard monetary value uses the authenticated tenant's configured currency.
  Dashboard aggregation assumes that all tenant orders are already denominated in
  that currency.
- Client applications should use a decimal library for calculations and currency-aware
  formatting for display. A JavaScript `number` is not a valid monetary transport or
  calculation type.

## Compatibility

Clients must read `amount` and `currency`; they must treat `amount` as a Decimal string.

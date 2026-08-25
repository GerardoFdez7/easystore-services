---
name: work-in-presentation
description: >-
  Implement, debug, review, test, or refactor EasyStore's complete NestJS code-first
  GraphQL boundary: domain resolvers and types, the public schema contract,
  authentication and tenant mapping, Apollo GraphQLModule configuration, validation
  limits, plugins, and centralized error formatting. Use for changes under
  src/domains/*/presentation or src/infrastructure/graphql, or whenever public
  GraphQL behavior, schema nullability, security, or operations change.
modeSlugs:
  - debug
  - code
  - reviewer
---

# Work in GraphQL presentation

Treat GraphQL presentation as one boundary: thin domain resolvers over application
use cases plus centrally secured Apollo infrastructure.

Read [implementation-patterns.md](references/implementation-patterns.md) before
changing domain types or resolvers. Read
[schema-contracts.md](references/schema-contracts.md) for public naming, nullability,
pagination, schema evolution, typed results, or disclosure decisions. Read
[apollo-infrastructure.md](references/apollo-infrastructure.md) for GraphQLModule,
validation limits, error formatting, plugins, observability, or caching.

## Workflow

1. Inspect analogous resolvers/types, the application contract, global guard,
   `src/infrastructure/graphql`, and the generated SDL.
2. Define the client use case, authentication posture, trusted identity source,
   tenant ownership, nullability, bounds, errors, and compatibility impact.
3. Keep tenant/user/employee/customer/role data out of client inputs and internal
   ownership identifiers out of outputs unless a reviewed client contract needs them.
4. Derive trusted identity with `@CurrentUser()` and pass every ownership scope the
   application contract requires. Never let object spreading override trusted data.
5. Delegate through `CommandBus` or `QueryBus`; do not implement business rules,
   access Prisma, call another domain directly, or construct transport-specific
   errors in the resolver.
6. Keep public access method-scoped. The global guard's default is authenticated;
   use `@Public()` only for explicitly public operations.
7. Keep server-wide authentication, query limits, error masking, and operational
   behavior centralized in `src/infrastructure/graphql`.
8. Update explicit type barrels and the generated SDL

Presentation may depend inward on its own domain but may not import another bounded
context directly. Central Apollo error formatting owns transport error codes and
masking; resolvers normally let application/domain errors propagate.

## Security invariants

- Scope tenant-owned work before lookup, relation resolution, count, ordering, or
  pagination; fail closed without revealing cross-tenant existence.
- Never expose or log secrets, tokens, cookies, headers, operation source, variables,
  raw errors, Prisma metadata, internal IDs, or complete request/response bodies.
- Keep introspection and landing pages disabled in production; bound depth, repeated
  field work, pagination, and batch inputs.
- Do not cache authenticated responses without every tenant and authorization
  dimension in the key and a defined invalidation policy.

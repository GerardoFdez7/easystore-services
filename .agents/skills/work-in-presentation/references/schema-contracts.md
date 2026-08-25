# GraphQL schema contracts

NestJS code-first classes are the source of truth. The generated
`src/infrastructure/graphql/schema.gql` is a review and lint artifact, not a file for
independent schema design.

## Types and nullability

- Use `@ObjectType`, `@InputType`, `@ArgsType`, and `@InterfaceType` with explicit
  field types where reflection is ambiguous: IDs, numbers, dates, enums, arrays, and
  optional fields.
- Model client concepts rather than Prisma records or aggregate internals. Keep
  tenant/auth identity IDs, ownership foreign keys, soft-delete state, credentials,
  and persistence metadata private by default.
- Keep trusted tenant, customer, employee, user, role, and permission data out of
  inputs when authenticated context provides it.
- Use non-null for values guaranteed on every successful result. Nullable means
  optional domain data, permission-safe omission, or an intentional independent
  partial failure—not swallowed exceptions.
- Prefer non-null collection containers and items, returning `[]` for a valid empty
  result. Use `ID` for identities and explicit enums for bounded choices.

## Naming

- Types and enums use `PascalCase`; fields and arguments use `camelCase`; enum values
  use `UPPER_CASE`.
- Use singular object names, plural collection fields, predicate booleans, and
  `verbNoun` mutations. Code suffixes such as `Type` must not leak into schema names.
- Preserve existing public `get...` queries unless a deprecation plan permits a
  rename. Prefer domain language over generic CRUD terminology for new behavior.

## Pagination

Use bounded page/limit pagination through shared `PaginationArgs`, `NamedPaginationArgs` or a cohesive
domain `@ArgsType`. Application code owns consistent validation and maximum size;
repositories apply tenant/owner filters before count, ordering, skip, or take. Use
typed sort enums and deterministic tie-breaking. Return the established items,
`total`, and `hasMore` shape.

Consider opaque cursor pagination only for large or high-write collections where
offset behavior is inadequate. Its stable indexed ordering, DTOs, repositories,
indexes, and client migration must be designed together; do not mix cursor and page
semantics or adopt Relay conventions by default.

## Errors and evolution

Use the GraphQL error channel for authentication, authorization, malformed requests,
invalid input, tenant-safe not-found, and unexpected failures. Use typed result
objects or unions only for expected business outcomes clients must branch on, such
as safe per-item batch results. Never duplicate one failure in both channels or
reveal conflicting resource IDs, another tenant's existence, fraud/authentication
detail, or arbitrary JSON metadata.

Deprecate before removal when compatibility is required and identify deliberate
breaking changes in the handoff. Do not introduce Relay nodes, global/base64 IDs,
custom scalars, interfaces, unions, or connection types without a concrete client
need that justifies their cross-layer cost.

## Security review

Treat every field and operation as public attack surface. Derive identity from the
global guard, keep public exceptions method-scoped, scope relations by tenant, bound
pagination/batches, and avoid enumeration fields. GraphQL type validation does not
replace transport normalization and domain invariants. Introspection control is
defense in depth, never authorization.

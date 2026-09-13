# Presentation implementation patterns

## GraphQL types

Use NestJS code-first decorators and explicit field types/nullability. A `.types.ts`
file declares at least one `@ObjectType`, `@InputType`, `@ArgsType`, or
`@InterfaceType`.

Inputs contain only client-controlled data. Never expose trusted `tenantId`,
`customerId`, `employeeId`, auth identity, role, or permissions when server context
can provide them. Outputs contain only fields needed by the public client contract;
ownership foreign keys and persistence metadata are private by default.

Use `ID` for identifiers, explicit enum functions, and explicit list item/container
nullability. Export every public GraphQL type by name from
`presentation/graphql/types/index.ts`; remove unused exported input types so they
cannot be accidentally exposed later.

## Resolvers

Resolvers use `@Resolver`, end in `Resolver`, and translate transport/auth data into
application DTOs:

```ts
@Resolver(() => WidgetType)
export class WidgetResolver {
  constructor(private readonly commandBus: CommandBus) {}

  @Mutation(() => WidgetType)
  createWidget(
    @Args('input') input: CreateWidgetInput,
    @CurrentUser() user: JwtPayload,
  ): Promise<WidgetType> {
    return this.commandBus.execute(
      new CreateWidgetDTO(input, user.tenantId, user.employeeId),
    );
  }
}
```

Prefer separate DTO constructor parameters for trusted identity. If the established
DTO accepts one object, spread client input first and assign trusted fields last.

Every collection query accepts the shared `PaginationArgs`, `NamedPaginationArgs` or a cohesive domain
`@ArgsType`, plus typed sort enums where supported. Pass values unchanged; consistent
bounds and validation belong to the application contract. Do not duplicate individual
pagination decorators across resolver methods.

Import related command DTOs from the command barrel and query DTOs from the query
barrel. Return the application's typed result or an explicit presentation mapping;
do not use unchecked casts.

## Authentication and errors

The global guard protects operations by default. Apply `@Public()` directly to each
operation whose contract is public; do not mark an entire resolver public when it
also contains authenticated operations. Use `@Authenticated()` only for a deliberate
method override on an otherwise public class during migration.

## Authorization

See [docs/AUTHORIZATION.md](../../../../docs/AUTHORIZATION.md) for the model and the
decorator reference. Authentication establishes identity; authorization runs after it
and is a separate decision every non-public operation must make explicitly.

`AuthorizationGuard` denies by default: an operation with neither `@RequirePermission`
nor `@AllowAccountTypes` is rejected. A new resolver method without one of these
fails closed, so never "fix" that denial by loosening the guard.

Both decorator arguments are enums — never string literals. A typo in a string
compiles and surfaces as an unexplained 403 rather than a build error:

```ts
@RequirePermission(FeatureEnum.CATALOG, PermissionActionEnum.CREATE)
@Mutation(() => WidgetType)
createWidget(
  @Args('input') input: CreateWidgetInput,
  @CurrentUser() user: JwtPayload,
): Promise<WidgetType> {
  return this.commandBus.execute(new CreateWidgetDTO(input, user.tenantId));
}
```

Choose the annotation by audience:

- Staff-facing operation → `@RequirePermission(feature, action)`. Map the action to
  intent, not to the mutation verb: routine adjustments are `EDIT`; `DELETE` is for
  structural removal.
- Customer-reachable operation → `@AllowAccountTypes(AccountTypeEnum.CUSTOMER)`. The
  gate only decides who may call it; the handler must still scope to
  `user.customerId`. A gate without an ownership check exposes every customer's
  records to every other customer.
- Owner-only operation → `@AllowAccountTypes(AccountTypeEnum.TENANT)`. Use for
  store identity, domain, currency, and billing, which no employee grant should reach.
- Operation serving several actors → one variadic `@AllowAccountTypes` decorator
  lists each type, e.g. `@AllowAccountTypes(AccountTypeEnum.TENANT,
AccountTypeEnum.CUSTOMER)`. An operation open to staff and customers alike
  carries both decorators, and the ownership check applies to the customer path
  only.

Tenants short-circuit to allowed within their own tenant, so `TENANT` never needs a
feature grant. Tenant scoping is independent of authorization: passing the permission
check never removes the obligation to scope queries by `user.tenantId`.

Authorization failures are `403`, distinct from authentication's `401`. Do not
convert one into the other, and do not return `null` or an empty collection to hide a
denial.

Do not catch and rewrite failures unless transport semantics require a tested safe
mapping. Do not return `null`, `[]`, `false`, or a success-shaped response for
authorization, tenant, repository, or unexpected failures. Never expose stack traces,
Prisma/external errors, exception metadata, credentials, tokens, internal IDs, or
cross-tenant existence.

## Tests and completion

Test CQRS delegation, authenticated identity injection, client-input separation,
public/protected metadata, authorization metadata, output exposure, and intentional
nullability. Assert that each operation carries the `@RequirePermission` or
`@AllowAccountTypes` its contract requires — a missing decorator is a security
defect, and metadata assertions are the only resolver-level test that catches it.
Do not duplicate application/domain behavior in resolver tests. Regenerate and lint
the SDL after output or input type changes.

# Presentation implementation patterns

## GraphQL types

Use code-first Nest GraphQL decorators and explicit field types/nullability:

```ts
@InputType()
export class CreateWidgetInput {
  @Field()
  name: string;
}

@ObjectType('Widget')
export class WidgetType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;
}
```

A `.types.ts` file declares at least one `@ObjectType`, `@InputType`, `@ArgsType`, or
`@InterfaceType`. Model nullable, optional, list, enum, ID, date, and pagination fields
explicitly rather than relying on TypeScript reflection alone. Keep persistence-only
and trusted fields out of client inputs.

## Resolvers

Every GraphQL `findAll`/collection query must accept the shared `PaginationArgs`
with `@Args()`, plus typed enum `sortBy` and `sortOrder` arguments when the resource
supports sorting. Pass those values unchanged to the application query DTO; do not
sort or paginate in the resolver.

Resolvers use `@Resolver`, end in `Resolver`, and translate transport/auth data into
application DTOs:

```ts
@Resolver(() => WidgetType)
export class WidgetResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  ///////////////
  // Mutations //
  ///////////////

  @Mutation(() => WidgetType)
  createWidget(
    @Args('input') input: CreateWidgetInput,
    @CurrentUser() user: JwtPayload,
  ): Promise<WidgetType> {
    return this.commandBus.execute(
      new CreateWidgetDTO({ ...input, tenantId: user.tenantId }),
    );
  }
}
```

Import related command DTOs from the application command barrel and related query
DTOs from the application query barrel, grouping each set in one import declaration.
Model related pagination and filter arguments in an `@ArgsType` class, following
`common/graphql/pagination.args.ts`, and accept the class with `@Args()` instead of
repeating individual `page`, `limit`, and filter decorators in resolver methods.

Obtain trusted tenant, user, employee, and authorization data from server context.
Never allow client input to override it. Apply `@Public()` or authentication overrides
only when the operation's security contract explicitly requires them.

Do not catch and rewrite errors unless transport semantics require a safe, stable
mapping. Never expose stack traces, Prisma errors, credentials, or cross-tenant
existence information.

## Tests and completion

Test delegation, authenticated identity injection, input-to-DTO mapping, nullability,
and public/protected behavior where meaningful. Do not duplicate application or domain
tests in resolver tests. Export every GraphQL type explicitly from
`presentation/graphql/types/index.ts`.

# Application implementation patterns

## CQRS DTOs and handlers

For every `findAll` or paginated collection query, define typed pagination and
sorting inputs explicitly. Carry `page`, `limit`, `sortBy`, and `sortOrder` from
the query DTO through the handler to its repository/ports; apply sorting before
pagination. When a sort key belongs to data supplied by another domain, enrich the
complete scoped collection first, sort the enriched DTOs, and only then paginate.
When no records match, return the query's typed empty state: an empty array for
array results, or an empty paginated result with accurate metadata. Do not throw
`NotFoundException` for an empty collection; reserve it for single-resource
lookups whose absence is an error.

Each command/query use case has its own kebab-case folder with sibling `.dto.ts` and
`.handler.ts` files. Use the matching decorator and generic interface.

Create/update DTOs reuse an aggregate `*Base`/`*BaseType` contract:

```ts
export class CreateWidgetDTO {
  constructor(public readonly data: IWidgetBase) {}
}
```

Purpose-specific actions, identity/form operations, delete/restore commands, and
queries may use narrower typed inputs. Use a `specializedMutationDtos` exception only
for a conventional create/update path whose semantics genuinely do not match the base
contract, and document the reason.

```ts
@CommandHandler(CreateWidgetDTO)
export class CreateWidgetHandler implements ICommandHandler<CreateWidgetDTO> {
  constructor(
    @Inject('IWidgetRepository')
    private readonly repository: IWidgetRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: CreateWidgetDTO): Promise<WidgetDTO> {
    // Execute domain logic
    const widget = this.publisher.mergeObjectContext(
      WidgetMapper.fromCreateDto(command.data),
    );

    // Persist entity
    await this.repository.create(widget);

    // Publish event
    widget.commit();

    // Return DTO
    return WidgetMapper.toDto(widget);
  }
}
```

For updates, load with typed IDs and tenant scope, fail with the project-standard
not-found error, invoke a domain transition, persist, then commit. Queries do not
mutate or commit events. Event handlers implement `IEventHandler<T>` and avoid loops
that re-emit the same event.

## Record ownership

See [docs/AUTHORIZATION.md](../../../../docs/AUTHORIZATION.md). For customer-reachable
use cases, the resolver's `@AllowAccountTypes` gate decides only that a customer may
call the operation. Which records they may reach is decided here, and a guard cannot
check it — a missing ownership filter exposes every customer's data to every other
customer while all tests still pass.

Scope by ownership in the same place tenant scope is applied, so a single query
enforces both:

```ts
async execute(query: GetOrderDTO): Promise<OrderDTO> {
  const order = await this.repository.findById(
    Id.create(query.id),
    Id.create(query.tenantId),
    query.customerId ? Id.create(query.customerId) : undefined,
  );

  if (!order) throw new NotFoundException('Order not found');

  return OrderMapper.toDto(order);
}
```

Filter in the repository query rather than loading a record and comparing afterwards;
post-hoc comparison is easy to omit on one branch. When the record genuinely must be
loaded first, throw the standard not-found error on an ownership mismatch rather than
a distinct forbidden error, so a probing client cannot learn that the record exists.

The owning identifier always arrives from the resolver's `@CurrentUser()`. A
`customerId` accepted from client input is not an ownership check.

## Mappers

Mapper classes have immediately preceding contract JSDoc and a sibling `.dto.ts`.
Keep persistence/domain/application translation centralized and typed:

```ts
export interface WidgetDTO extends IWidgetType {}

/** Converts Widget values across application boundaries. */
export class WidgetMapper {
  static fromCreateDto(input: IWidgetBase): Widget {
    return Widget.create(input);
  }

  static toDto(widget: Widget): WidgetDTO {
    const props = widget.getProps();

    return {
      id: props.id.getValue(),
      tenantId: props.tenantId.getValue(),
      name: props.name.getValue(),
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}
```

Do not use GraphQL or raw Prisma types as application results.

## Ports

Define a consumer-owned capability contract with immediately preceding JSDoc:

```ts
/** Product lookup capability needed by the Widget application layer. */
export interface IProductAdapter {
  getProduct(id: string, tenantId: string): Promise<ProductDetailsDTO | null>;
}
```

Name it for the capability the consumer needs, not the provider's internal entity.
Create the same-named infrastructure adapter at the same time. Export application
artifacts explicitly from their required barrels.

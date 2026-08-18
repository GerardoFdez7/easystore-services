# Application implementation patterns

## CQRS DTOs and handlers

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
export class CreateWidgetHandler
  implements ICommandHandler<CreateWidgetDTO>
{
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

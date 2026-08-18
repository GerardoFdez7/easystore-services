# Aggregate implementation patterns

Inspect the live base classes and analogous aggregate before using these patterns.

## Attribute contracts

Keep creation-compatible fields reusable and compose a complete boundary type:

```ts
export interface IWidgetBase {
  tenantId: string;
  name: string;
}

export interface IWidgetSystem {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IWidgetType extends IWidgetBase, IWidgetSystem {}
```

Use a narrower aggregate-owned action contract when an operation does not represent
the base shape. Do not duplicate structurally identical contracts within the same
bounded context.

## Aggregate roots and nested entities

Only the configured root imports `Entity` and `EntityProps` directly from
`@shared/entity.base` and extends `Entity<TProps>`. A nested entity imports
`DomainEntity` and `DomainEntityProps` from `@shared/domain-entity.base` and extends
`DomainEntity<TProps>` so it cannot publish aggregate events independently.

Both use a private constructor plus distinct factories:

```ts
export class Widget extends Entity<IWidgetProps> {
  private constructor(props: IWidgetProps) {
    super(props);
  }

  static create(input: IWidgetBase): Widget {
    const now = new Date();
    const widget = new Widget({
      id: Id.generate(),
      tenantId: Id.create(input.tenantId),
      name: Name.create(input.name),
      createdAt: now,
      updatedAt: now,
    });
    widget.apply(new WidgetCreatedEvent(widget));
    return widget;
  }

  static reconstitute(props: IWidgetProps): Widget {
    return new Widget(props);
  }
}
```

`create` establishes valid new state and may emit creation events. `reconstitute`
restores persisted state and must not emit creation events. Root methods coordinate
nested changes and apply the meaningful event. Avoid string-literal `get('field')`
inside entity implementations; use typed props, `getProps()`, or explicit getters.

## Value objects

Use a private constructor and validate through `create`:

```ts
const codeSchema = z.string().trim().min(1).max(64);

export class WidgetCode {
  private constructor(private readonly value: string) {}

  static create(value: string): WidgetCode {
    return new WidgetCode(codeSchema.parse(value));
  }

  getValue(): string {
    return this.value;
  }

  equals(other: WidgetCode): boolean {
    return this.value === other.value;
  }
}
```

Keep value objects immutable. Put validation that protects a domain invariant here,
not only at the GraphQL boundary.

## Events and repository contracts

Use past-tense fact names and Nest CQRS's event contract:

```ts
export class WidgetCreatedEvent implements IEvent {
  constructor(public readonly widget: Widget) {}
}
```

Apply events only after valid state exists. Repository interfaces remain domain-
oriented and have immediately preceding contract JSDoc:

```ts
/** Durable operations required for the Widget aggregate. */
export interface IWidgetRepository {

  /**
    * Creates a new widget.
    * @param widget The widget to create.
    * @returns The created widget.
    * @throws If the widget could not be created.
   */
  create(widget: Widget): Promise<Widget>;

  /**
    * Finds an existing widget.
    * @param id The ID of the widget to find.
    * @param tenantId The tenant ID of the widget to find.
    * @returns The found widget, or null if not found.
    * @throws If the widget could not be found.
   */
  findById(id: Id, tenantId: Id): Promise<Widget | null>;
}
```

Use entities/value objects rather than Prisma or GraphQL types. Make tenant scope and
not-found semantics explicit.

## Tests and completion

Test accepted and rejected factory inputs, `create` versus `reconstitute` event
behavior, transition invariants, immutable state, nested-entity coordination, and
event payloads. Export every public aggregate artifact explicitly from the required
barrels; never use `export *`.


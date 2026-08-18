# Infrastructure implementation patterns

## Persistence repositories

Use `@Injectable()`, end the class name in `Repository`, and implement the aggregate
repository interface unless a reasoned reference-data exception applies:

```ts
@Injectable()
export class WidgetRepository implements IWidgetRepository {
  constructor(private readonly prisma: PostgreService) {}

  async findById(id: Id, tenantId: Id): Promise<Widget | null> {
    const record = await this.prisma.widget.findUnique({
      where: { id: id.getValue(), tenantId: tenantId.getValue() },
    });
    return record ? WidgetMapper.fromPersistence(record) : null;
  }
}
```

Return domain entities/application DTOs as required by the contract, never raw Prisma
records. Use explicit `select`/`include`, project database-error utilities, and typed
mappers. Scope tenant-owned reads, writes, upserts, uniqueness checks, deletes, and
relationship connects by tenant.

Use a transaction when one business operation changes several records or when a
read-check-write sequence must be atomic. Preserve rollback behavior and translate
known Prisma constraints without leaking database details.

For soft deletion or archival, apply the same visibility predicate consistently to
reads and relationships. Make intentional include-deleted operations explicit.

## Cross-domain adapters

An application port and same-named adapter are introduced together:

```ts
@Injectable()
export class ProductAdapter implements IProductAdapter {
  constructor(private readonly queryBus: QueryBus) {}

  getProduct(
    id: string,
    tenantId: string,
  ): Promise<ProductDetailsDTO | null> {
    return this.queryBus.execute(new GetProductDetailsDTO(id, tenantId));
  }
}
```

The adapter implements the consumer's port and imports it from `application/ports`.
It may call only the provider domain's public application commands/queries, usually
through `CommandBus` or `QueryBus`; never import provider aggregates, repositories,
infrastructure, or presentation.

Validate and narrow external-service responses before mapping them. Apply timeouts,
retry/idempotency behavior, and credential handling only when the integration needs
them; do not log secrets or complete payloads.

## Tests and completion

Test tenant-qualified filters, null/not-found behavior, mapping, transaction success
and rollback, expected constraint translations, archive/delete visibility, and adapter
request/response translation. Integration tests are preferable where mocking Prisma
would hide query semantics. Export implementations explicitly and update their
provider bindings when necessary.


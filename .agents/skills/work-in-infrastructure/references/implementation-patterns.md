# Infrastructure implementation patterns

## Persistence repositories

Collection repository contracts must accept the approved pagination/filter/sort
options they can apply safely, including explicit `sortBy` and `sortOrder`. Always
scope collection reads by tenant or owner before ordering and paging; never infer a
sort field from untrusted strings or interpolate it into raw SQL.

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

Run every PostgreSQL repository write inside `PostgreService.$transaction`, including
single-record creates, updates, and deletes. Keep every read-check-write sequence in
the same transaction so the check cannot race the mutation. Preserve rollback
behavior and translate known Prisma constraints without leaking database details.

Use `@shared/infrastructure/postgres/prisma-error-utils.ts` for repository error translation. Route
Prisma failures through `handlePrismaDatabaseError` (and use
`executeDatabaseOperation` when it makes the operation clearer); do not add or use a separate helper.

## Import organization and barrels

Organize imports by dependency group: framework and generated-client imports first,
then common infrastructure and utilities, aggregate contracts/value objects,
application mappers or ports, and finally same-folder modules. Keep each group
contiguous and remove duplicate imports from the same source.

Prefer the layer's explicit barrel when it exports the required symbol (for example,
`aggregates/repositories`, `aggregates/value-objects`, `application/mappers`, and
infrastructure adapter or persistence barrels). Add an explicit named export to the
appropriate barrel when the artifact is part of that layer's public surface. Use a
deep import only for intentionally private artifacts, and never introduce `export *`.

For soft deletion or archival, apply the same visibility predicate consistently to
reads and relationships. Make intentional include-deleted operations explicit.

## Cross-domain adapters

An application port and same-named adapter are introduced together:

```ts
@Injectable()
export class ProductAdapter implements IProductAdapter {
  constructor(private readonly queryBus: QueryBus) {}

  getProduct(id: string, tenantId: string): Promise<ProductDetailsDTO | null> {
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

## Contract tests and completion

Test tenant-qualified filters, null/not-found behavior, mapping, transaction success
and rollback, expected constraint translations, archive/delete visibility, and adapter
request/response translation with focused repository or adapter contract tests. Do not
place integration tests in infrastructure; application command handlers own them.
Export implementations explicitly and update their provider bindings when necessary.

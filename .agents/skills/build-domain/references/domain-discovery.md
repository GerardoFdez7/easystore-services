# Domain discovery and modeling

Use this reference before creating a bounded context, changing ownership, or adding a
new persisted aggregate.

## Discover the capability

Convert the request into a small domain brief. Resolve or explicitly assume:

1. What business outcome does the domain own?
2. Which terms have precise meanings, and which existing domain already owns each
   neighboring concept?
3. What is the aggregate consistency boundary? Which object is the root, and which
   objects cannot exist independently?
4. Which invariants must hold before and after every state transition?
5. Which operations are commands, which are queries, and what should each return?
6. Which facts should become domain events after successful state changes?
7. Which failures are expected business outcomes versus infrastructure failures?
8. Is every record tenant-owned, globally shared reference data, or user-owned? Where
   does the trusted tenant/user identity come from?
9. Which capabilities belong to other domains and therefore require ports?
10. What existing data, migration compatibility, pagination, sorting, filtering,
    archival, and deletion behavior must be preserved?
11. Which variables/objects are value objects, which are entities with identity, and which are simple data types?

Ask the user when alternative answers would change the public API, aggregate boundary,
or persistence model. Do not block on names or mechanical details that can be inferred
from established conventions.

## Produce an implementation map

Before editing, map each behavior to an owner:

| Concern | Owner |
| --- | --- |
| invariants and state transitions | aggregate root/value objects |
| creation and reconstitution | entity factories/mappers |
| durable access contract | aggregate repository interface |
| use-case orchestration | command/query handler |
| cross-domain capability needed | consumer application port |
| cross-domain translation | consumer infrastructure adapter |
| SQL/Prisma behavior | infrastructure repository |
| transport validation and authentication context | GraphQL resolver/types |
| dependency registration | domain module |

If a rule has two owners, clarify the boundary. Do not duplicate the same validation in
GraphQL, a handler, and the entity unless each validation serves a different boundary.
Transport validation protects the API shape; domain validation protects the invariant.

## Model types deliberately

- Put creation-compatible business data in `I<Entity>Base`.
- Put persistence/system fields such as IDs and timestamps in `I<Entity>System` when
  separating them improves reuse.
- Compose the complete boundary representation as `I<Entity>Type`.
- Keep internal entity props expressed in value objects, entities, and dates, extending
  the correct base props interface.
- Use discriminated unions, branded/value-object types, and explicit result types where
  they make invalid states unrepresentable.
- Do not use `any`. Avoid `unknown as` and non-null assertions; when boundary data is
  unknown, validate/narrow it before entering the domain.
- Reuse a shared type only when its semantics, invariants, and lifecycle are genuinely
  identical. Similar field shapes alone are not a reason to couple bounded contexts.

## Review the model before implementation

Confirm that:

- all writes enter through the aggregate root;
- nested entities cannot publish aggregate events independently;
- `create` and `reconstitute` have distinct event semantics;
- every repository operation reflects an actual application need and includes tenant
  scope where applicable;
- cross-domain reads/writes are capabilities rather than leaked provider entities;
- GraphQL inputs omit trusted fields supplied by authentication, such as `tenantId`;
- deletions are explicitly hard, soft, archival, or prohibited;
- concurrency and transactions are defined for multi-record invariants;
- event handlers are idempotent when delivery may repeat.


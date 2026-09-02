# Architecture contract

Treat `tools/architecture/check.mjs`, `tools/architecture/config.mjs`, and
`.semgrep.yml` as authoritative. This reference explains their current intent; read
the files themselves before changing architecture.

## Dependency direction

| Source               | May depend on                                                          | Must not depend on                                                                                |
| -------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `aggregates`         | same aggregate layer, `@shared/*`, approved aggregate packages         | application, infrastructure, presentation, another domain                                         |
| `application`        | own aggregates, own application, shared code                           | presentation, another domain directly                                                             |
| `infrastructure`     | own aggregate/application contracts, shared/global `@infrastructure/*` | presentation; another domain except from an adapter to that domain's public application contracts |
| `presentation`       | own application contracts and safe domain types                        | persistence implementation details                                                                |
| `<domain>.module.ts` | all own layers needed for composition                                  | another domain's internals                                                                        |

Current aggregate external allowlist: `@nestjs/cqrs`, `zod`, and `zod/v4`.
Everything else must remain aggregate-local or use `@shared/*`.

Cross-domain collaboration follows this flow:

```text
consumer application -> consumer application port
                     -> consumer infrastructure adapter
                     -> provider public application command/query
```

Never import another domain from aggregates, application handlers, repositories,
resolvers, or modules as a shortcut. An adapter is the only cross-domain integration
location, and it may translate only provider application contracts.

## Required domain shape

```text
src/domains/<domain>/
├── aggregates/
│   ├── entities/index.ts
│   ├── events/index.ts
│   ├── repositories/index.ts
│   └── value-objects/index.ts
├── application/
│   ├── commands/index.ts
│   ├── events/index.ts
│   ├── mappers/index.ts
│   ├── ports/index.ts                 # optional, paired with adapters
│   └── queries/index.ts
├── infrastructure/
│   ├── adapters/index.ts              # optional, paired with ports
│   └── persistence/
│       ├── postgres/
│       └── mappers/index.ts           # optional when persistence mappers exist
├── presentation/graphql/
│   ├── <domain>.resolver.ts
│   └── types/index.ts
└── <domain>.module.ts
```

The checker requires these directories even when an initial domain has no artifact
of a given kind: aggregate entities/events/repositories/value-objects; application
commands/events/mappers/queries; PostgreSQL persistence; GraphQL presentation and
types. Required and optional component directories need an `index.ts` under the rules
above.

Group code as follows:

- each entity and its attributes live in `entities/<entity>/`;
- each event family lives in `events/<entity-or-concept>/`;
- each command lives in `commands/<operation>/<entity-or-use-case>/`;
- each query lives in `queries/<operation>/<entity-or-use-case>/`;
- each mapper lives in `mappers/<entity-or-concept>/`;
- grouping directories contain subfolders plus `index.ts`, not loose implementation
  files;
- helper-only application code may live in a clearly named `shared/` folder when it
  is not a use case.

Use kebab-case for every folder. Use kebab-case files with descriptive suffixes such
as `.entity.ts`, `.attributes.ts`, `.event.ts`, `.interface.ts`, `.vo.ts`, `.dto.ts`,
`.handler.ts`, `.mapper.ts`, `.port.ts`, `.adapter.ts`, `.repository.ts`,
`.resolver.ts`, `.types.ts`, `.module.ts`, and `.spec.ts`.

## Artifact invariants enforced by the checker

- Configure exactly one aggregate root path per domain in `aggregateRoots`.
- Extend path-specific aggregate-root and domain-name coverage in `.semgrep.yml` when
  adding a domain; do not rely on the structural checker as a reason to leave Semgrep
  coverage stale.
- An aggregate root directly imports `Entity` and `EntityProps` from
  `@shared/aggregates/entities/entity.base` and extends `Entity<Props>`.
- A nested entity directly imports `DomainEntity` and `DomainEntityProps` from
  `@shared/aggregates/entities/domain-entity.base` and extends `DomainEntity<Props>`.
- Every entity has a private constructor, `static create`, `static reconstitute`, a
  sibling attributes interface, and explicit barrel exports.
- Attributes expose a reusable name containing `Base` and a complete name ending in
  `Type`.
- Entity implementations never use string-literal property access such as
  `entity.get('id')`.
- A value-object file exports a class or enum. A class has a private constructor,
  `create` or `generate`, and `getValue`.
- A domain event exports a class ending in `Event`, imports `IEvent` from
  `@nestjs/cqrs`, and implements it.
- A repository contract exports `I*Repository` and has immediately preceding JSDoc.
- Command/query/event handlers use `@CommandHandler`, `@QueryHandler`, or
  `@EventsHandler` and implement the matching generic handler interface.
- Every non-event handler has a sibling DTO.
- Every command handler has a matching
  `__tests__/<handler-file-name>.spec.ts`.
- Create/update DTOs reuse an aggregate `*Base`/`*BaseType`, unless a path-specific,
  reasoned exception exists.
- A mapper exports a documented `*Mapper` class and has a sibling mapper DTO.
- A port exports a documented `I*` interface and has a same-named adapter.
- An adapter is `@Injectable()`, ends in `Adapter`, implements its application port,
  and imports that port from `application/ports`.
- A PostgreSQL repository is `@Injectable()`, ends in `Repository`, and implements an
  aggregate repository contract unless a reasoned exception exists.
- A GraphQL resolver uses `@Resolver` and ends in `Resolver`.
- A `.types.ts` file declares `@ObjectType`, `@InputType`, `@ArgsType`, or
  `@InterfaceType`.
- A domain module uses `@Module` and exports a class ending in `Domain`.

## Barrels and exceptions

Barrels explicitly export every public implementation below them. `export *` and
namespace imports are forbidden by ESLint. Tests and files inside a `shared/` helper
folder are not barrel API.

Exceptions are path-specific entries in `tools/architecture/config.mjs`, require a
non-empty architectural reason, and must point to an existing file. Use them only for
a real semantic mismatch with a default convention. Never add an exception because
implementation was inconvenient.

Current categories are:

- `specializedMutationDtos`: create/update commands based on a narrower aggregate-
  owned action contract instead of the full base shape;
- `persistenceRepositoryContractExceptions`: infrastructure repositories that do not
  represent aggregate repositories, such as read-only reference data.

Purpose-specific operations such as contact forms, identity actions, delete/restore,
and queries do not need a mutation DTO exception when they are outside conventional
create/update DTOs.

## Useful live exemplars

Inspect these rather than copying snippets blindly:

- aggregate root and nested entity: `inventory/aggregates/entities/warehouse` and
  `inventory/aggregates/entities/stock-per-warehouse`;
- domain event and repository contract: `inventory/aggregates/events/warehouse` and
  `inventory/aggregates/repositories/warehouse.interface.ts`;
- CQRS command and test: `inventory/application/commands/create/warehouse`;
- mapper and port: `inventory/application/mappers/warehouse` and
  `inventory/application/ports/address.port.ts`;
- adapter and repository: `inventory/infrastructure/adapters/address.adapter.ts` and
  `inventory/infrastructure/persistence/postgres/warehouse.repository.ts`;
- GraphQL and composition: `inventory/presentation/graphql` and
  `inventory/inventory.module.ts`.

For a new bounded context, also register its domain module in `src/app.module.ts`.

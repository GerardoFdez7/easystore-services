---
name: work-in-infrastructure
description: >-
  Implement, debug, review, test, or refactor infrastructure-layer code,
  including Prisma/PostgreSQL repositories, persistence mapping, transactions,
  database error translation, and cross-domain adapters. Use for any task
  touching src/domains/*/infrastructure.
modeSlugs:
  - debug
  - code
  - reviewer
---

# Work in infrastructure

Implement application and aggregate contracts without leaking infrastructure details
inward.

Read [implementation-patterns.md](references/implementation-patterns.md) before
changing repositories or adapters. Inspect the interface being implemented, Prisma
schema/generated types, error utilities, and an analogous implementation.

## Workflow

1. Establish the contract, tenant boundary, transaction boundary, expected failures,
   and persistence or external-service representation.
2. Make the smallest implementation change while keeping mapping at the boundary.
3. Use adapters—not direct imports elsewhere—for cross-domain communication.
4. Add focused repository or adapter contract tests proportional to branching and
   risk, especially tenant isolation, transactions, constraints, soft deletion, and
   error translation. Integration tests belong to application command handlers.
5. Update explicit barrels and module providers when the implementation surface
   changes.
6. Identify focused contract tests and any lint, build, or architecture checks
   specific to the change.

## Shared transactions and domain events

Use `TransactionManager` from
`@shared/infrastructure/postgres/transaction-manager` when one operation writes
through multiple repositories. `execute()` starts one PostgreSQL transaction or
reuses the active one; participating repositories use `transactions.client` inside
that boundary rather than opening independent `PostgreService.$transaction` calls.

For cross-domain workflows, keep orchestration behind consumer-owned ports and their
infrastructure adapters. Adapters may invoke provider public commands, but must not
import provider aggregates or repositories. Each provider command remains responsible
for creating its aggregate through its factory and persisting it through its own
repository.

`TransactionalEventPublisher` defers aggregate event publication until the active
`TransactionManager` transaction commits. Continue to merge aggregate contexts and
commit only after persistence succeeds.

Infrastructure must not import presentation. Never weaken tenant filters or expose raw
Prisma/external errors to satisfy a test.

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
4. Add tests proportional to branching and risk, especially tenant isolation,
   transactions, constraints, soft deletion, and error translation.
5. Update explicit barrels and module providers when the implementation surface
   changes.
6. Run focused tests, lint, build, and architecture checks before the full harness.

Infrastructure must not import presentation. Never weaken tenant filters or expose raw
Prisma/external errors to satisfy a test.

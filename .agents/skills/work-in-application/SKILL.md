---
name: work-in-application
description: >-
  Implement, debug, review, test, or refactor application-layer code, including
  CQRS command/query/event handlers, use-case DTOs, mappers, and cross-domain
  ports. Use for any task touching src/domains/*/application.
modeSlugs:
  - debug
  - code
  - tester
  - reviewer
---

# Work in application

Keep application code focused on use-case orchestration and inward-facing contracts.

Read [implementation-patterns.md](references/implementation-patterns.md) before
changing handlers, DTOs, mappers, or ports. Read
[testing-and-quality.md](references/testing-and-quality.md) whenever an application
command handler or its integration test changes. Read
[docs/AUTHORIZATION.md](../../../docs/AUTHORIZATION.md) when a handler serves a
customer-reachable use case, since record ownership is enforced here and nowhere else.

## Workflow

1. Define the use case's input, output, tenant scope, record ownership, collaborators,
   failure behavior, and domain transition.
2. Inspect the aggregate/repository contracts and an analogous handler before editing.
3. Keep business invariants in the aggregate. Let the handler load, coordinate,
   persist, commit successful events, and map results.
4. Introduce an application port for a capability owned by another domain; pair it
   with an infrastructure adapter rather than importing that domain directly.
5. Enforce record ownership for any use case a customer can reach. `PermissionsGuard`
   decides whether a customer may call an operation; only the handler can decide
   which records they get. Include the resolver-provided `customerId` from
   `@CurrentUser()` in the repository query alongside tenant scoping before loading
   or mutating records; never use one taken from client input or rely on a
   post-load assertion.
6. Update explicit barrels. When a command handler changes, update its matching
   colocated integration test.

Application code must not import presentation or another bounded context directly.

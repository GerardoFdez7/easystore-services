---
name: work-in-application
description: >-
  Implement, debug, review, test, or refactor application-layer code, including
  CQRS command/query/event handlers, use-case DTOs, mappers, and cross-domain
  ports. Use for any task touching src/domains/*/application.
modeSlugs:
  - debug
  - code
---

# Work in application

Keep application code focused on use-case orchestration and inward-facing contracts.

Read [implementation-patterns.md](references/implementation-patterns.md) before
changing handlers, DTOs, mappers, or ports. Read
[testing-and-quality.md](references/testing-and-quality.md) whenever application
behavior or its tests change.

## Workflow

1. Define the use case's input, output, tenant scope, collaborators, failure behavior,
   and domain transition.
2. Inspect the aggregate/repository contracts and an analogous handler before editing.
3. Keep business invariants in the aggregate. Let the handler load, coordinate,
   persist, commit successful events, and map results.
4. Introduce an application port for a capability owned by another domain; pair it
   with an infrastructure adapter rather than importing that domain directly.
5. Update explicit barrels and meaningful behavioral tests.

Application code must not import presentation or another bounded context directly.

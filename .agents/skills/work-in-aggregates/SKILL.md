---
name: work-in-aggregates
description: >-
  Implement, debug, review, or refactor aggregate-layer code, including
  aggregate roots, nested entities, attribute contracts, value objects, domain
  events, and repository interfaces. Use for any task touching
  src/domains/*/aggregates, whether it is new behavior, a bug fix, or
  maintenance.
modeSlugs:
  - debug
  - code
---

# Work in aggregates

Preserve aggregate ownership, invariants, and independence from outer layers.

Read [implementation-patterns.md](references/implementation-patterns.md) before
changing aggregate code. Also inspect the live architecture checker, aggregate-root
configuration, and a relevant existing aggregate.

## Workflow

1. Identify the invariant, transition, factory, contract, or event actually in scope.
2. Confirm which entity is the configured aggregate root and which entities are
   nested inside its consistency boundary.
3. Make the smallest complete domain change. Keep validation and transitions in the
   model rather than shifting them to handlers or persistence.
4. Update domain events, repository contracts, attributes, and explicit barrels only
   when the changed behavior requires them.
5. Add or update focused tests for factories, reconstitution, value validation,
   invariants, state transitions, and emitted events.
6. Run focused tests, lint, and architecture checks before the full root harness.

Do not import application, infrastructure, presentation, or another bounded context.

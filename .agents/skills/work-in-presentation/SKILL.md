---
name: work-in-presentation
description: >-
  Implement, debug, review, test, or refactor GraphQL presentation code,
  including resolvers, object/input/args types, authentication context mapping,
  and transport validation. Use for any task touching
  src/domains/*/presentation.
modeSlugs:
  - debug
  - code
---

# Work in presentation

Keep presentation as a thin, secure translation boundary over application use cases.

Read [implementation-patterns.md](references/implementation-patterns.md) before
changing GraphQL types or resolvers. Inspect the application DTO/handler contract,
authentication decorators, shared GraphQL helpers, and an analogous resolver.

## Workflow

1. Define the GraphQL operation, transport input/output, authentication source,
   nullability, and application DTO it delegates to.
2. Keep trusted tenant/user fields out of client-controlled input and derive them from
   authenticated context.
3. Delegate through `CommandBus`/`QueryBus`; do not implement domain rules or access
   Prisma in the resolver.
4. Update explicit type barrels and add focused resolver/type tests where mapping,
   authorization, or nullability behavior is non-trivial.
5. Run focused tests, lint, build, and architecture checks before the full harness.

Presentation may depend inward on its own domain but may not import another bounded
context directly.


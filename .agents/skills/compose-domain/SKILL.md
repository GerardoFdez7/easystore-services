---
name: compose-domain
description: Implement, debug, review, or refactor NestJS domain composition, including domain modules, provider tokens, handler/resolver registration, imports/exports, and AppModule integration. Use for tasks touching src/domains/*/*.module.ts or domain registration in src/app.module.ts.
---

# Compose a domain

Wire existing contracts and implementations without moving business logic into the
composition root.

Read [implementation-patterns.md](references/implementation-patterns.md) before
changing module providers, tokens, imports, or exports. Inspect all affected handler,
repository, adapter, and resolver exports first.

## Workflow

1. Identify the providers the domain owns and the capabilities it intentionally
   exposes.
2. Bind repository/port tokens to their implementations and register every required
   command, query, event handler, and resolver exactly once.
3. Add only required Nest module imports and exports; avoid using another domain's
   internals as a shortcut.
4. Register a new domain module in `src/app.module.ts`.
5. Run module-focused tests or compile checks, then architecture and the root harness.


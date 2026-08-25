# Coding standards

Read `eslint.config.mjs` and `tsconfig.json` before coding. The live configuration is
authoritative; this reference records the stronger type discipline expected of new
and changed code.

## Type safety

- Give every function and public module boundary an explicit return type.
- Do not use explicit `any`, unsafe assignment, non-null assertions, or unchecked
  double casts such as `as unknown as T`.
- Validate and narrow data at external boundaries before passing it into the domain.
- Prefer interfaces, discriminated unions, generics, value objects, and typed builders
  over open dictionaries and string-based property selection.
- Await thenables, handle or deliberately propagate failures, and leave no floating or
  misused promise.
- Keep unused parameters only when a required signature needs them and prefix their
  names with `_`.

The compiler is not globally strict, so a successful build alone does not prove new
code is safely typed. Follow these stronger rules and the type-aware ESLint checks.

## Language and naming

- Use strict equality and braces for control-flow blocks.
- Keep variables and functions camelCase; keep classes, interfaces, enums, and other
  type-like declarations PascalCase.
- Use kebab-case paths and descriptive artifact suffixes within domains.
- Do not use `console`; where operational logging is necessary, use the project global logger:

```typescript
logger.log/error/warn/debug/verbose/fatal(message: any, context?: any)
```

- Do not use wildcard/namespace imports or `export *`. Import and export explicit
  symbols so architectural APIs remain reviewable.
- Prefer named exports unless the surrounding repository convention requires a
  default export.

## Organization and documentation

Keep each artifact focused: entities own invariants, handlers orchestrate, mappers
translate, repositories persist/query, resolvers translate transport data, and modules
compose dependencies. Do not move business logic into resolvers, Prisma repositories,
DTO constructors, or event handlers merely because those locations have the data.

The architecture checker requires immediately preceding JSDoc on repository
interfaces, application ports, and mapper classes. Document contracts, ownership,
tenant behavior, return semantics, and material failures. Comments should explain
non-obvious reasons, not narrate code.

## Errors, logging, and security

- Reuse the project error hierarchy; do not expose raw Prisma or external-service
  errors at application or presentation boundaries.
- Log actionable context without credentials, tokens, passwords, cookies, private
  customer data, or full request bodies.
- Obtain trusted tenant/user identity from authentication context, not client input.
- Scope tenant-owned reads, writes, uniqueness checks, and relationship connects.
- Avoid leaking existence across tenants through errors or unscoped lookups.

Before completion, review changed code for unsafe casts, non-null assertions, console
calls, wildcard exports/imports, string-key entity access, lower-layer presentation
imports, and direct cross-domain imports outside adapters. Review matches
semantically; do not silence them with lint or architecture exclusions.

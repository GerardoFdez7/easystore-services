# Architecture checks

Pull requests run `npm run architecture` to enforce the Domain-Driven Design boundaries under `src/domains/*/aggregates`.

The checks require:

- relative imports to stay inside the same domain's `aggregates` directory;
- shared domain primitives to use `@shared/*`;
- third-party aggregate dependencies to be explicitly allowlisted in `tools/check-architecture.mjs`;
- every `*.entity.ts` to have a matching `*.attributes.ts` file;
- every entity and attributes file to be exported by the aggregate's `entities/index.ts`;
- every aggregate root declared in `tools/architecture.config.mjs` to import `Entity` and `EntityProps` directly from `@shared/entity.base` and extend `Entity<TProps>`;
- nested entities to extend the event-free `DomainEntity<TProps>` base rather than CQRS `AggregateRoot`;
- every entity to use factory construction through a private constructor plus `create` and `reconstitute` methods;
- entity implementations to use typed props or explicit getters instead of string-key `get('property')` calls.

The pre-commit hook runs the fast structural validator. Semgrep remains in the pull-request workflow because starting the Python-based scanner on every commit is noticeably slower.

## Duplicate code

`npm run duplication` uses jscpd to detect repeated TypeScript token blocks, including repeated interface and function bodies. The current legacy baseline is capped at 6.7%; pull requests fail if total duplication rises above it. Tests are excluded because repeated fixture setup is often intentional.

This is a copy/paste detector, not a proof that two independently written implementations have the same meaning. Semantic DRY cannot be enforced reliably by static analysis without producing substantial false positives.

Run the structural checks without Semgrep with `npm run architecture:structure`. Run only the Semgrep rules with `npm run architecture:semgrep` after installing the Semgrep CLI.

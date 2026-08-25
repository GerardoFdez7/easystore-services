# Application command-handler integration tests

## Required structure

Every command handler requires this colocated structure:

```text
application/commands/<operation>/<use-case>/
├── <use-case>.dto.ts
├── <use-case>.handler.ts
└── __tests__/
    └── <use-case>.handler.spec.ts
```

The checker enforces the path; the test must still prove behavior.

## Behavioral matrix

Cover the relevant cases for each handler:

- mapped result and success outcome;
- repository/port inputs, including tenant scope and typed IDs;
- interaction order: load/map, domain transition, persist, commit, return;
- commit only after persistence succeeds;
- not-found, invariant, repository, and adapter failures;
- optional fields and empty collections;
- authentication-derived values overriding or excluding client input;
- relevant edge cases.

## Test design

Use Arrange-Act-Assert and behavior-based names. Prefer typed fixture builders and
`jest.Mocked<T>`. Avoid broad mocks that bypass the behavior under test and large
snapshots. Assert observable results and important collaborations rather than private
implementation.

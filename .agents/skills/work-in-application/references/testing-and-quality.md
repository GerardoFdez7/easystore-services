# Application testing and quality

## Command test structure

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
- optional fields, empty collections, pagination/filter/sort boundaries;
- authentication-derived values overriding or excluding client input;
- queries performing no writes or event commits;
- event-handler side effects, error behavior, and idempotency where delivery may
  repeat.
- edge cases

Test mappers for bidirectional fidelity, value-object conversion, optional/null data,
nested collections, and dates.

## Test design

Use Arrange-Act-Assert and behavior-based names. Prefer typed fixture builders and
`jest.Mocked<T>`. Avoid `any`, `as unknown as`, non-null assertions, broad mocks that
bypass the behavior under test, and large snapshots. Assert observable results and
important collaborations rather than private implementation.

Run the smallest relevant Jest scope during iteration, then the root quality harness
before completion.

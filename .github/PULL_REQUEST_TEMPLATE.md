## Summary

<!-- Explain what this PR changes and why the change is needed. -->

- **Problem solved or capability introduced:**
- **Why this approach:**

## Impact

<!-- Describe effects on existing behavior, security, performance, tenant isolation, data integrity, and operations. Write "None" only when there is no impact. -->

- **Affected bounded contexts:**
- **Security and tenant-isolation impact:**
- **Performance and operational impact:**
- **Data or migration impact:**

## Changes

<!-- List the important implementation and contract changes. Remove this comment before submission. -->

-

## Testing

<!--
Domain behavior is tested through colocated command-handler integration tests at:
src/domains/<domain>/application/commands/<operation>/<use-case>/__tests__/<use-case>.handler.spec.ts

Do not add duplicate aggregate unit, repository contract, adapter, resolver, or
layer-specific test suites when the command integration test covers the behavior.
-->

- **Integration tests added or updated:**
  - Path:
  - Scenarios covered:
- **Verification commands executed:**
  - `npm run test -- <test-path>`
  - `npm run architecture`
- **If tests were unchanged, explain which existing integration test covers the change:**

## Checklist

- [ ] All developer-facing content is in English; localized resources use their target language.
- [ ] I reviewed my own changes and removed placeholders and unrelated changes.
- [ ] Existing and relevant command integration tests pass.
- [ ] Architecture, duplication, lint, and build checks pass.
- [ ] DDD boundaries and CQRS responsibilities are preserved.
- [ ] Authentication, authorization, and tenant isolation were considered.
- [ ] Transactions, idempotency, concurrency, and error handling were considered where relevant.
- [ ] Security and performance implications are documented above.

## Related Issues

<!-- Link issues or PRs, for example: "Closes #123". Write "None" when not applicable. -->

-

## Breaking Changes

<!-- Describe GraphQL, database, event, configuration, or application-port incompatibilities and the migration plan. Write "None" when not applicable. -->

-

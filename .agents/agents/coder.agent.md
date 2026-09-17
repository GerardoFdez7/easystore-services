# Coder

Inspect the current worktree and relevant implementation, then make the requested change. Preserve unrelated edits.

Treat ESLint, TypeScript, Prettier, architecture checks, Semgrep, jscpd, and test
results as executable specifications. Inspect a configuration when needed to
understand or fix its result; never weaken a gate to make a change pass. Follow the
affected layer's test conventions.

## Test boundary

- When some layer (aggregates/application/infrastructure/presentation) of a use case changes, write or update only its integration
  test under `src/domains/*/application/commands/**/__tests__/`.
- Edit only the matching `<handler>.spec.ts`; do not create or modify unit tests,
  tests in another layer, outside domains/ or a different handler's spec.
- The matching integration test must exercise the application handler through the
  relevant domain boundaries and cover the changed success, failure, tenant
  isolation, boundary, and interaction-ordering behavior.
- If a requested test does not fit that path or filename, report the constraint
  instead of widening the test scope.

## Security baseline

- Derive trusted tenant and user identity from authenticated server context.
- Scope tenant-owned reads, writes, uniqueness checks, relations, caches, events, and
  background work; fail closed without cross-tenant existence leaks.
- Validate untrusted input at boundaries and enforce business invariants in domain
  types. Use parameterized Prisma APIs and treat dynamic data and external responses
  as untrusted.
- Preserve authorization, credential/token handling, expiry, revocation, cookie
  protections, and constant-time verification. Never log or expose secrets, raw
  infrastructure errors, or unnecessary personal data.

Run `npm run verify` after all implementation and test edits are complete;
do not run independent lint, typecheck, test, formatting, architecture, Semgrep,
duplication, or other verification commands. Use that result to determine
whether the work is complete or whether an in-scope local fix is needed. If a fix is required,
make it and run `npm run verify` once more. Determine completion from the final
verification result, and report any remaining failure that is out of scope precisely.
Do not add dependencies, destructive migrations, or breaking public behavior without approval.

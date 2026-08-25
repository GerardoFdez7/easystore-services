---
name: dry-refactoring
description: >-
  Eliminate meaningful copy-paste duplication reported jscpd gate using
  semantics-preserving extraction and verification. Use when npm run duplication
  fails, when adding repeated domain/application code, or when reviewing whether
  similar interfaces, functions, classes, DTOs, or tests should share an
  abstraction.
modeSlugs:
  - code
  - debug
  - reviewer
---

# DRY refactoring

Eliminate copy-paste duplication without coupling unrelated bounded contexts or
weakening the repository's duplication policy.

## Prerequisites

In Coder or Debugger mode, first run the repository-configured jscpd gate. In
read-only Reviewer mode, use the supplied gate output and inspect the reported clone
locations instead.

```bash
npm run duplication
```

For focused diagnosis, preserve `.jscpd.json` settings and add the AI reporter:

```bash
npx jscpd --config .jscpd.json --reporters console,ai <path>
```

## Workflow

Coder and Debugger perform the full workflow below. Reviewer evaluates whether the
reported duplication is semantic, whether the extraction preserves ownership, and
whether the supplied verification covers all call sites; Reviewer does not edit or
run commands.

1. Run `npm run duplication` and locate both sides of each clone.
2. Read the complete containing functions/classes and their tests.
3. Decide whether the code has the same semantics, owner, invariants, and reasons to
   change. Similar syntax across bounded contexts is not sufficient.
4. Extract the smallest clear function, type, value object, test builder, module, or
   stable base behavior.
5. Update every call site and add/adjust tests that preserve behavior.
6. Run focused tests, `npm run lint`, `npm run architecture`, and
   `npm run duplication`.
7. Repeat with the highest-impact meaningful clone.

## Refactoring Strategies

**Extract function** — when the duplicate is a block of logic:

```ts
// Before: same block in two places
// After: shared function called from both places
```

**Extract module/utility** — when the duplicate spans multiple files in different domains:

```ts
// Move shared logic to a shared utility file and import it
```

**Extract constant or config** — when the duplicate is repeated data or configuration.

**Composition/shared value object** — when behavior and invariants are genuinely
ubiquitous across domains.

**Template/base class** — only when the duplicate represents a stable behavioral
contract, not merely a similar class shape.

Always ensure:

- All call sites are updated, not just the two reported by jscpd
- Tests still pass after refactoring
- The extracted abstraction has a clear, descriptive name
- No bounded context now imports another context's internal implementation
- No jscpd threshold or ignore was changed merely to silence the finding

## Tips

- Start with clones that have the highest line count — they have the most impact
- A clone between test files may indicate a missing test helper
- Clones across unrelated modules may signal a missing shared utility
- A cross-format clone (same logic in a `.js` and a `.ts` file, found with `--cross-formats`) often means code was ported without deleting the original — consolidate into one implementation (usually the TypeScript one) and update imports, rather than extracting a third shared copy
- Prefer focused reporters for diagnosis, but validate with the checked-in config
- Some repeated orchestration is preferable to a misleading cross-domain abstraction

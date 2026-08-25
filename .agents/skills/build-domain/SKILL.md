---
name: build-domain
description: >-
  Discover, model, and coordinate a new bounded context or a domain capability
  that changes ownership or spans multiple architectural layers. Use for
  domain-level planning and cross-layer integration; use the applicable layer
  skills for implementation details.
modeSlugs:
  - architect
---

# Build a domain

Define the domain boundary and coordinate the necessary layers without duplicating
their implementation guidance.

## References

- Read [architecture-contract.md](references/architecture-contract.md) to determine
  required structure, dependency direction, registrations, and exceptions.
- Read [domain-discovery.md](references/domain-discovery.md) before establishing a new
  bounded context, aggregate boundary, persistence model, or public capability.

## Workflow

1. Use the supplied Explorer brief, including executable architecture rules and an
   analogous domain, without assuming its business model should be copied. Request
   targeted follow-up research when evidence is missing.
2. Define ownership, aggregate boundaries, invariants, commands, queries, events,
   external capabilities, tenant scope, persistence impact, and public API behavior.
3. Map each concern to the layers that must change. Do not scaffold or edit layers
   that the capability does not require.
4. Use the relevant implementation skills:
   - `work-in-aggregates` for domain models and repository contracts;
   - `work-in-application` for CQRS use cases, DTOs, mappers, ports, and handlers;
   - `work-in-infrastructure` for adapters and persistence;
   - `work-in-presentation` for GraphQL transport;
   - `compose-domain` for module and provider wiring.
5. Reconcile contracts across the selected layers, explicit barrels, architecture
   configuration, Semgrep coverage, Prisma artifacts, and module registration.
6. Define focused and repository-level verification for the write-capable modes.

For a localized layer task, skip this skill and use only the matching layer skill.

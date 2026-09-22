# EasyStore Services

EasyStore Services is a multi-tenant e-commerce backend built as a NestJS modular
monolith with DDD, hexagonal layering, CQRS, GraphQL, Prisma/PostgreSQL, and Jest.

## Agent routing

This policy is provider-agnostic: apply it with Codex, Claude, Gemini, or any other
AI system that can delegate work. Start every request with
`.agents/agents/orchestrator.agent.md`. The Orchestrator is the only profile that
coordinates work; it must summon a separate agent for each delegated role and pass
that agent the corresponding profile.

Select models by capability tier, using the best available model from the active
provider. The examples below are illustrative, not a dependency on a specific
provider or model family.

| Delegated task | Profile | Model requirement |
| --- | --- | --- |
| Focused repository inspection, behavior tracing, and evidence gathering | `explorer.agent.md` | Lowest capable tier (for example, GPT-5.6 Luna with low reasoning) |
| Implementation-ready plan, architecture decision, or cross-layer design | `architect.agent.md` | Highest available tier (for example, GPT-6 Astra with high reasoning or GPT-5.6 Sol) |
| Approved implementation | `coder.agent.md` | Mid-capability tier suited to code changes (for example, GPT-5.6 Terra with medium reasoning or Claude Sonnet) |
| A reproducible failure Coder could not resolve in scope | `debugger.agent.md` | Mid-to-high capability tier, selected for the failure's complexity |

The default flow for work that needs a plan is:

1. Orchestrator summons Explorer with the lowest capable model and retrieves its evidence brief.
2. Orchestrator summons Architect with the evidence brief and the highest available model, then retrieves the plan.
3. Orchestrator summons Coder with the approved plan and a mid-capability implementation model, then retrieves the implementation and verification result.

For a small, self-contained implementation request, Orchestrator may summon Coder
directly. Summon Debugger only after Coder reports a reproducible unresolved failure.

## Behavior

- Be direct and concise. Lead with the result, evidence, risk, or decision.
- Use only the context needed for the task. Preserve unrelated worktree changes.
- Prefer the smallest complete change and do not broaden the requested scope.
- Ask only when a missing decision would materially affect behavior, a public
  contract, data, security, or destructive impact.
- Do not add dependencies, expose secrets, perform destructive operations, or make
  externally visible breaking changes without explicit approval.
- Report exact evidence and distinguish current-task failures from pre-existing ones.

# Apollo infrastructure, errors, and plugins

Configure Apollo only through NestJS `GraphQLModule` with `ApolloDriver` under
`src/infrastructure/graphql`. Preserve code-first generation and Nest dependency
injection. Do not introduce standalone Apollo bootstrap, resolver maps,
context-created persistence clients, or direct data-source access from resolvers.

## Secure server configuration

- Put only trusted request/response objects in context; the global Nest guard owns
  authentication and resolvers use project identity decorators.
- Disable production introspection and embedded landing pages by default. Disable
  stack traces and HTTP batching, enable CSRF prevention, and fail closed on missing
  security configuration.
- Enforce bounded depth and total field work. Expand fragment spreads safely and
  count aliases and repeated selections; depth alone is not a work model.
- Bound page sizes and batch inputs again in application code. Rate-limit credential,
  reset, contact, search, export, and other abuse-sensitive public operations using a
  trusted key and shared store when horizontally scaled.

## Central error policy

Resolvers and handlers throw project-standard errors; one Apollo `formatError`
policy maps them. Preserve safe GraphQL parse/validation failures and otherwise
return only a stable message/code plus GraphQL path and locations.

| Failure                        | Public code             | Public message            |
| ------------------------------ | ----------------------- | ------------------------- |
| Missing/invalid authentication | `UNAUTHENTICATED`       | `Authentication required` |
| Authenticated but forbidden    | `FORBIDDEN`             | `Operation not permitted` |
| Invalid input                  | `BAD_USER_INPUT`        | `Invalid request`         |
| Tenant-safe missing resource   | `NOT_FOUND`             | `Resource not found`      |
| Expected uniqueness conflict   | `CONFLICT`              | `Resource already exists` |
| Unexpected failure             | `INTERNAL_SERVER_ERROR` | `Internal server error`   |

Never serialize error metadata, causes, stacks, HTTP objects, database fields,
external payloads, or resource identifiers. Log unexpected failures through the
project logger using a fixed safe event and an existing trusted correlation ID; do
not log raw exceptions, queries, variables, headers, cookies, tokens, or customer
data. Partial data is valid only for a deliberately nullable, independent field.

## Plugins and observability

Add plugins only for concrete server concerns: draining Apollo-owned resources,
aggregate timings/error counts, approved tracing, persisted-operation enforcement,
or request query-cost budgets. Authorization, tenant lookup, orchestration, and
persistence remain in guards, application handlers, and repositories.

Record only bounded values such as operation name/type, duration, public outcome
code, and trusted correlation ID. Do not emit field timings or tracing details in
production responses. Usage reporting requires explicit header/variable exclusion.
Keep hooks non-blocking and ensure their failure cannot change application results;
test drain ordering.

Response caching requires authorization- and tenant-complete keys, mutation and
sensitive-data exclusion, and defined invalidation before enablement. Persisted
operations likewise require an explicit client rollout and invalidation plan.

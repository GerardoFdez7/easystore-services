# Domain composition patterns

Use the domain module as a composition root only:

```ts
const CommandHandlers = [CreateWidgetHandler, UpdateWidgetHandler];
const QueryHandlers = [GetWidgetHandler];
const EventHandlers = [WidgetCreatedHandler];

@Module({
  imports: [CqrsModule],
  providers: [
    { provide: 'IWidgetRepository', useClass: WidgetRepository },
    { provide: 'IProductAdapter', useClass: ProductAdapter },
    WidgetResolver,
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
  ],
})
export class WidgetDomain {}
```

The module uses `@Module` and its class ends in `Domain`. Injection tokens match the
interfaces consumed by handlers. Prefer existing token conventions; do not silently
introduce a second token for the same contract.

Register all handlers exported by the selected use cases and ensure every registered
implementation is explicitly exported from its layer barrel. Do not register domain
entities or value objects as providers.

Export only capabilities intended for external consumers. Cross-domain calls still
flow through consumer ports/adapters and provider application contracts; module
imports do not authorize direct imports of another domain's aggregate or repository.

For a new bounded context, import its `<domain>Domain` class in `src/app.module.ts`.
Check for dependency cycles and duplicate provider registration. Compilation or a
Nest testing-module test should resolve every token after wiring changes.

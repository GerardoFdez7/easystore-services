# Authorization

Authentication establishes identity ([AUTHENTICATION.md](AUTHENTICATION.md)).
Authorization decides what that identity may do. Every non-public operation must
make this decision explicitly.

## Decision

Three actor types, three mechanisms, because their questions differ in kind:

| Actor        | Question                                      | Mechanism                     |
| ------------ | --------------------------------------------- | ----------------------------- |
| **Tenant**   | Is this the store owner?                      | Implicit full access          |
| **Employee** | Does the owner allow this person this action? | Feature × action permissions  |
| **Customer** | Is this record theirs?                        | Account-type gate + ownership |

`AuthorizationGuard` runs globally after `AuthenticationGuard` and **denies by default**: an
operation with neither `@RequirePermission` nor `@AllowAccountTypes` is rejected.

## Rules

- Authentication, authorization, and tenant scoping are three independent checks.
  Passing one never satisfies another. An authorized employee still needs tenant
  scoping; a permitted customer still needs an ownership check.
- Permissions are resolved per request, never embedded in the JWT. Revoking access
  takes effect on the next request, not the next login.
- Authorization failures are `403`; authentication failures are `401`. Never mask a
  denial as `null`, `[]`, `false`, or a success-shaped response.
- Decorator arguments are always enums, never string literals. A wrong string
  compiles and surfaces as an unexplained `403` instead of a build error.
- Tenants are scoped to their own tenant. Full access never means cross-tenant access.
- An operation reachable by customers requires **both** the account-type gate and a
  handler-level ownership filter. The gate alone exposes every customer's records to
  every other customer.

## Actors

### Tenant

The store owner has every permission within their own tenant. The guard
short-circuits on `accountType === TENANT` — no role row, no permission lookup.

Owner-only operations (store identity, domain, currency, billing) are expressed with
`@AllowAccountTypes(AccountTypeEnum.TENANT)`. No employee grant can reach them.

Subscription tier is a separate concern from authorization, keyed on
`Tenant.subscription`.

### Employee

Employees hold a role the tenant defines. A role is a set of `(feature, action)`
pairs, stored in `RoleFeatures`.

- A **feature** is a functional area named as a shop owner would name it, deliberately
  coarser than a resolver: `CATALOG`, `INVENTORY`, `ORDERS`, `CUSTOMERS`, `ANALYTICS`,
  `SETTINGS`.
- An **action** is `VIEW`, `CREATE`, `EDIT`, or `DELETE`. These four are exhaustive.
  There is no aggregate action such as `FULL`: a role holding every action holds four
  rows, so the guard answers any permission question with one exact lookup and the UI
  renders each cell as an independent checkbox.

Every tenant is seeded with four preset roles, flagged `isSystem`, covering the
common cases:

| Preset          | Catalog | Inventory | Orders | Customers | Analytics | Settings |
| --------------- | ------- | --------- | ------ | --------- | --------- | -------- |
| **Manager**     | full    | full      | full   | full      | view      | —        |
| **Cashier**     | view    | view      | full   | view      | —         | —        |
| **Storekeeper** | edit    | full      | view   | —         | —         | —        |
| **Support**     | view    | view      | edit   | edit      | —         | —        |

Shorthand for readability only, never stored values: "full" = all four action rows,
"edit" = `VIEW` + `EDIT` rows, "—" = no rows.

Presets are per-tenant rows, so editing one affects only that store. `isSystem` is a
UI affordance — the guard never reads it. Tenants needing something else clone a
preset and edit the feature × action grid.

### Customer

A customer's constraint is about records, not features, so feature grants do not
apply to them. Two layers, both required:

1. **Account-type gate** — `@AllowAccountTypes(AccountTypeEnum.CUSTOMER)` decides
   whether a customer may call the operation at all. Absent it, a logged-in customer
   calling `createProduct` is rejected before any handler runs.
2. **Ownership** — the handler filters on the trusted `customerId`. The gate says a
   customer may call `myOrders`; only the handler decides which orders come back.

Layer 1 is a guard and fails closed. Layer 2 lives in handlers because it needs the
record, and no guard can verify it.

## Decorator reference

Both enums live in `src/domains/shared/aggregates/value-objects/authorization/`.

```typescript
// Staff-facing: what feature, what action.
@RequirePermission(FeatureEnum.CATALOG, PermissionActionEnum.CREATE)

// Which account types may reach this operation at all. Variadic — an operation
// serving more than one actor lists each of them.
@AllowAccountTypes(AccountTypeEnum.TENANT, AccountTypeEnum.CUSTOMER)
```

Choosing the annotation:

| Situation                      | Annotation                                      |
| ------------------------------ | ----------------------------------------------- |
| Staff operation                | `@RequirePermission(feature, action)`           |
| Customer-reachable             | `@AllowAccountTypes(CUSTOMER)` + ownership      |
| Both staff and customers       | Both decorators; ownership applies to customers |
| Owner-only                     | `@AllowAccountTypes(TENANT)`                    |
| Genuinely public (no identity) | `@Public()`                                     |

Operations serving more than one actor are common — `getCustomerById`, `getCart`, and
`getAllAddresses` each serve staff and customers — which is why the decorator takes a
list rather than a single type.

Map the action to intent, not to the mutation verb. Routine adjustments — changing
stock levels, updating quantities — are `EDIT`. `DELETE` is for structural removal.

`FeatureEnum` must stay aligned with seeded `Feature.code` values, and
`PermissionActionEnum` with the Prisma `PermissionAction` enum. The action alignment
is asserted at compile time; the feature alignment is asserted at startup, and the
application refuses to start if a `FeatureEnum` member has no `Feature` row — a
missing row silently denies every operation referencing it.

## Guard decision order

1. `@Public()` → allow.
2. Neither authorization decorator present → **deny** and log.
3. Resolve whether the caller matches `@AllowAccountTypes`.
4. A matching account type authorizes the operation when no
   `@RequirePermission` is present.
5. `accountType === TENANT` → allow without a permission lookup. Tenant access is
   still limited to the tenant identified by the authenticated request.
6. `accountType === CUSTOMER` → allow only when it matches `@AllowAccountTypes`;
   ownership remains the handler's responsibility.
7. `accountType === EMPLOYEE` → when `@RequirePermission` is present, check the
   `(feature, action)` pair against the employee's resolved permission set. This
   permission path is also used when the employee does not match
   `@AllowAccountTypes`.
8. If neither the account-type path nor the permission path authorizes the caller,
   deny with `403`.

The employee permission set loads once per request and is memoised on the request
object, so a query touching a dozen protected fields costs one lookup.

## Ownership in handlers

Scope by ownership in the same query that applies tenant scope:

```typescript
const order = await this.repository.findById(
  Id.create(query.id),
  Id.create(query.tenantId),
  query.customerId ? Id.create(query.customerId) : undefined,
);

if (!order) throw new NotFoundException('Order not found');
```

Filter in the repository query rather than loading a record and comparing afterwards —
post-hoc comparison is easy to omit on one branch. When a record must be loaded
first, throw the standard not-found error on an ownership mismatch rather than a
distinct forbidden error, so a probing client cannot learn the record exists.

The owning identifier always originates from `@CurrentUser()`. A `customerId` taken
from client input is not an ownership check.

## JWT payload

`accountType` is explicit in the token, never inferred from which of
`customerId`/`employeeId` happens to be set:

```typescript
export interface JwtPayload {
  email: string;
  accountType: AccountTypeEnum;
  authIdentityId: string;
  tenantId: string;
  customerId?: string;
  employeeId?: string;
}
```

## Data model

```prisma
enum PermissionAction {
  VIEW
  CREATE
  EDIT
  DELETE

  @@schema("tenant")
}

model RoleFeatures {
  id        String           @id
  roleId    String
  featureId String
  action    PermissionAction
  tenantId  String
  Feature   Feature          @relation(fields: [featureId], references: [id])

  @@unique([roleId, featureId, action])
  @@schema("tenant")
}

model EmployeeRole {
  id       String  @id
  role     String
  isSystem Boolean @default(false)
  tenantId String

  @@unique([tenantId, role])
  @@schema("tenant")
}

model Feature {
  id           String         @id
  code         String         @unique
  name         String         @postgres.Citext
  description  String?
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt
  roleFeatures RoleFeatures[]

  @@schema("tenant")
}
```

`Feature` is global reference data keyed by unique `code`, seeded in
`production.seed.ts`. The `@@unique` on `RoleFeatures` prevents duplicate grants that
are invisible in the UI but inflate every permission query.

## Testing

- Guard decision order, especially the tenant short-circuit and the unannotated-
  operation denial.
- Permission resolution: a role's grid maps to the right allow/deny set, and revoking
  a grant takes effect on the next request.
- Cross-tenant isolation: an employee of tenant A is denied on tenant B's records even
  holding the right feature grant.
- Customer ownership: for every customer-reachable operation, another customer's
  record is neither returned nor mutated, and the denial is indistinguishable from
  not-found. This is the class of bug the guard cannot catch.
- Preset correctness: each seeded preset grants what the table says, since a wrong
  preset silently misconfigures every tenant that picks it.

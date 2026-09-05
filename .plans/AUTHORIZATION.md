# Authorization — implementation plan

> **Status:** plan, not documentation. The settled contract lives in
> [docs/AUTHORIZATION.md](../docs/AUTHORIZATION.md) — consult that when writing code.
> This file records the rationale, the per-operation worklist, and the rollout
> sequence. Delete it once the rollout is complete.

Design for role- and permission-based authorization, layered on top of the
existing authentication described in [docs/AUTHENTICATION.md](../docs/AUTHENTICATION.md).

Authentication answers _"who are you"_. Authorization answers _"what may you
do"_. The `AuthGuard` already establishes identity; everything here runs after
it and assumes `req.user` is populated.

## Model

Three actor types, deliberately handled by three different mechanisms, because
their questions differ in kind:

| Actor        | Question to answer                              | Mechanism                    |
| ------------ | ----------------------------------------------- | ---------------------------- |
| **Tenant**   | Is this the store owner?                         | Implicit full access          |
| **Employee** | Does the owner allow this person this action?    | Feature × action permissions  |
| **Customer** | Is this record theirs?                           | Account-type gate + ownership |

### Tenant

The owner has every permission within their own tenant, unconditionally. There
is no role row for a tenant, and no permission lookup — the guard short-circuits
on `accountType === TENANT`.

The only ceiling on a tenant is subscription tier (a separate concern from
authorization, keyed on `Tenant.subscription`, not modelled here).

### Employee

Employees get permissions through a role the tenant controls. A role is a set
of `(feature, action)` pairs.

- A **feature** is a functional area of the product, phrased the way a shop
  owner would: Catalog, Orders, Customers, Inventory, Reports, Settings. It is
  intentionally coarser than a GraphQL resolver.
- An **action** is one of `VIEW`, `CREATE`, `EDIT`, `DELETE`.

The existing `Feature` and `RoleFeatures` tables already model roles as
tenant-defined, which is the right shape — but `RoleFeatures` currently has no
action column, so it can only say "may touch Catalog", never "may see orders but
not refund them". Read-only access is the single most requested restriction, so
the action column is required. See [Schema changes](#schema-changes).

#### Preset roles

Asking a non-technical shop owner to fill a permission grid from scratch is a
bad first experience. Every tenant is seeded with four system presets covering
the common cases, selectable with one click:

| Preset              | Catalog | Inventory | Orders | Customers | Reports | Settings |
| ------------------- | ------- | --------- | ------ | --------- | ------- | -------- |
| **Manager**         | full    | full      | full   | full      | view    | —        |
| **Cashier**         | view    | view      | full   | view      | —       | —        |
| **Storekeeper**     | edit    | full      | view   | —         | —       | —        |
| **Support**         | view    | view      | edit   | edit      | —       | —        |

Shorthand for readability only, never stored values: "full" = all four action rows,
"edit" = `VIEW` + `EDIT` rows, "—" = no rows. There is deliberately no aggregate
`FULL` action — it would force every permission lookup into
`action = X OR action = 'FULL'`, turn the grid's fifth column into state that must
stay synchronized with the other four, and duplicate what four rows already express.

A tenant who needs something else clones a preset and edits the grid, which
keeps the flexible path available without making it the default path. Presets
are per-tenant rows flagged `isSystem`, not global rows — so a tenant can rename
or adjust "Cashier" without affecting anyone else, and deleting a tenant cleans
up naturally through the existing cascade.

#### The permission grid

Custom roles are edited as a checkbox grid — features down, actions across:

```
Role: "Weekend staff"

                View   Create   Edit   Delete
Catalog          [x]     [ ]     [ ]     [ ]
Inventory        [x]     [ ]     [x]     [ ]
Orders           [x]     [x]     [x]     [ ]
Customers        [x]     [ ]     [ ]     [ ]
Reports          [ ]     [ ]     [ ]     [ ]
Settings         [ ]     [ ]     [ ]     [ ]
```

This is the whole mental model a tenant ever has to hold. Two axes, both named
in plain language.

### Customer

Customers are not employees with a weak role — their constraint is about
_records_, not _features_. A customer may read orders, but only orders that are
theirs. Modelling that as a feature grant would answer the wrong question.

Two layers, both required:

1. **Account-type gate** — an operation must be explicitly opened to customers
   with `@AllowAccountTypes(CUSTOMER)`. Absent that, a logged-in customer
   calling `createProduct` is rejected before any handler runs. This closes the
   privilege-escalation hole by default rather than by diligence.
2. **Ownership** — the handler filters on `user.customerId`. The gate says a
   customer may call `myOrders`; only the handler can say _which_ orders come
   back.

Layer 1 is a guard and cannot be forgotten silently (deny-by-default). Layer 2
lives in handlers because it needs the record.

## Schema changes

Three changes, all additive.

### 1. Action on `RoleFeatures`

```prisma
enum PermissionAction {
  VIEW
  CREATE
  EDIT
  DELETE

  @@schema("tenant")
}

model RoleFeatures {
  id           String           @id
  roleId       String
  featureId    String
  action       PermissionAction   // new
  tenantId     String
  employeeRole EmployeeRole @relation(fields: [roleId], references: [id], onDelete: Cascade, onUpdate: Cascade)
  feature      Feature      @relation(fields: [featureId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  tenant       Tenant       @relation(fields: [tenantId], references: [id], onDelete: Cascade, onUpdate: Cascade)

  @@unique([roleId, featureId, action])   // new — one grant per cell
  @@index([roleId])
  @@index([featureId])
  @@index([tenantId])
  @@schema("tenant")
}
```

The `@@unique` matters: without it the grid can accumulate duplicate grants that
are invisible in the UI but inflate every permission query.

### 2. System-preset flag on `EmployeeRole`

```prisma
model EmployeeRole {
  id           String         @id
  role         String
  isSystem     Boolean        @default(false)   // new — seeded preset
  tenantId     String
  // ...unchanged
  @@unique([tenantId, role])                    // new — no duplicate role names
}
```

`isSystem` marks the four presets seeded for every tenant, distinguishing them
from roles the tenant built by hand. It buys three things in the UI: presets can
be listed separately from custom roles, a "reset to defaults" action knows what
to restore, and deleting a preset can be blocked or warned about since new
employees are likely assigned to one.

It is a **UI affordance, not an authorization mechanism** — the guard never reads
it, and a preset grants access exactly the way a custom role does. If the role
management screen ends up with no reset action and no preset/custom split, this
column earns nothing and should be dropped.

### 3. Seed the feature catalog

`Feature` is global reference data (`code` is already `@unique`), seeded once in
`production.seed.ts` rather than per tenant:

`CATALOG`, `INVENTORY`, `ORDERS`, `CUSTOMERS`, `REPORTS`, `SETTINGS`.

Note the current development seed creates a single ad-hoc `CATALOG` feature and
a `MANAGER` role with no action — both need updating to the new shape.

### Migration note

There is no production data, so no data-preserving migration is needed. Reset
and re-seed: `prisma migrate reset` in development, and the seeds create the
feature catalog and presets in their new shape. The existing `RoleFeatures` rows
carry no action column and no code reads them, so nothing is lost.

This is worth doing before the first real tenant exists — afterwards, adding a
required column to a permissions table means backfilling grants, and getting a
backfill wrong means either locking people out or handing them access.

## JWT payload

`accountType` must be added to the token. It is currently absent, and the type
is only inferrable from which of `customerId`/`employeeId` happens to be set —
a guard should not deduce identity from the shape of undefined fields.

```typescript
export interface JwtPayload {
  email: string;
  accountType: AccountTypeEnum; // new — explicit, not inferred
  authIdentityId: string;
  tenantId: string;
  customerId?: string;
  employeeId?: string;
}
```

Set it in `sign-in.handler.ts`, which already computes `accountTypeVO` and can
pass `accountTypeVO.getValue()` straight through.

Permissions are deliberately **not** embedded in the token. A tenant who revokes
an employee's access expects it to take effect now, not after that employee
happens to log out — and a role edit affecting twenty employees cannot invalidate
twenty tokens. Permissions are resolved per request and cached for that request's
lifetime (see below).

Existing tokens issued before this change lack `accountType`. Either treat a
missing value as a forced re-login, or backfill by inference during a short
deprecation window.

## Enforcement

A `PermissionsGuard` runs globally, after `AuthGuard`, and reads metadata set by
decorators — the same pattern `@Public()` and `@Authenticated()` already use, so
it needs no new concepts.

### Type safety

String literals in a decorator are exactly where a typo becomes a silent
security hole: `@RequirePermission('CATALOGUE', 'CREATE')` compiles, and if the
guard's lookup finds no matching grant it denies — so the mistake surfaces as a
mysterious 403 rather than a build error. Both axes are enums, and the decorator
accepts nothing else.

Following the existing value-object convention (`TypeEnum`, `AccountTypeEnum`),
these live in `src/domains/shared/aggregates/value-objects/authorization/`:

```typescript
// feature.vo.ts
export enum FeatureEnum {
  CATALOG = 'CATALOG',
  INVENTORY = 'INVENTORY',
  ORDERS = 'ORDERS',
  CUSTOMERS = 'CUSTOMERS',
  REPORTS = 'REPORTS',
  SETTINGS = 'SETTINGS',
}

// permission-action.vo.ts
export enum PermissionActionEnum {
  VIEW = 'VIEW',
  CREATE = 'CREATE',
  EDIT = 'EDIT',
  DELETE = 'DELETE',
}
```

The decorator signature admits only those:

```typescript
export const RequirePermission = (
  feature: FeatureEnum,
  action: PermissionActionEnum,
): MethodDecorator => SetMetadata(RequirePermissionKey, { feature, action });

export const AllowAccountTypes = (
  ...accountTypes: AccountTypeEnum[]
): MethodDecorator => SetMetadata(AllowAccountTypesKey, accountTypes);
```

`PermissionActionEnum` must stay identical to the Prisma `PermissionAction`
enum, and `FeatureEnum` to the seeded `Feature.code` values. Prisma generates its
own enum types, so assert the alignment once rather than trusting it:

```typescript
// compile-time: fails the build if the two drift
const _actionsAlign: Record<PermissionActionEnum, PrismaPermissionAction> = {
  [PermissionActionEnum.VIEW]: PrismaPermissionAction.VIEW,
  [PermissionActionEnum.CREATE]: PrismaPermissionAction.CREATE,
  [PermissionActionEnum.EDIT]: PrismaPermissionAction.EDIT,
  [PermissionActionEnum.DELETE]: PrismaPermissionAction.DELETE,
};
```

`FeatureEnum` cannot be checked this way — `Feature.code` is seeded data, not a
Prisma enum — so a startup assertion belongs in the seed or a bootstrap check:
every `FeatureEnum` member must exist as a `Feature` row, and the app should
refuse to start otherwise. A feature code present in the enum but missing from
the table denies every operation that references it.

Both enums are registered with `registerEnumType` when exposed through the
role-management GraphQL API, matching how `AccountTypeEnum` is handled today.

### Decorators

```typescript
// Employee-facing operations: what feature, what action.
@RequirePermission(FeatureEnum.CATALOG, PermissionActionEnum.CREATE)

// Which account types may reach this operation at all.
@AllowAccountTypes(AccountTypeEnum.CUSTOMER)
```

### Guard order

```
AuthGuard          → identity        (401 on failure)
PermissionsGuard   → authorization   (403 on failure)
```

The distinction is worth keeping honest: 401 means "I don't know who you are",
403 means "I know exactly who you are, and no". Returning 401 for a permission
failure invites clients to pointlessly re-authenticate.

### Decision order in `PermissionsGuard`

1. `@Public()` → allow (no identity to check).
2. No `@RequirePermission` and no `@AllowAccountTypes` → **deny**, and log
   loudly. Deny-by-default is the entire point: an unannotated resolver is an
   unreviewed resolver. See [Rollout](#rollout) for how to get there without
   breaking everything on day one.
3. `@AllowAccountTypes` present and the caller's type is absent from it → deny.
4. `accountType === TENANT` → allow (owner, full access).
5. `accountType === CUSTOMER` → allow if it passed step 3. Feature permissions
   do not apply; ownership is the handler's job.
6. `accountType === EMPLOYEE` → load the permission set and check the
   `(feature, action)` pair.

### Usage

```typescript
@RequirePermission(FeatureEnum.CATALOG, PermissionActionEnum.CREATE)
@Mutation(() => ProductType)
async createProduct(
  @Args('input') input: CreateProductInput,
  @CurrentUser() user: JwtPayload,
): Promise<ProductType> {
  return this.commandBus.execute(
    new CreateProductDTO({ ...input, tenantId: user.tenantId }),
  );
}
```

```typescript
@AllowAccountTypes(AccountTypeEnum.CUSTOMER)
@Query(() => PaginatedOrdersType)
async myOrders(@CurrentUser() user: JwtPayload) {
  // handler filters on user.customerId — the gate alone is not enough
  return this.queryBus.execute(new GetOrdersDTO(user.tenantId, user.customerId));
}
```

### Caching

A naive implementation queries `RoleFeatures` on every field resolution. Load
the employee's permission set **once per request**, memoised on the request
object:

```typescript
// inside PermissionsGuard
const req = GqlExecutionContext.create(context).getContext().req;
req.__permissions ??= await this.permissionService.loadFor(user.employeeId);
```

A GraphQL query touching a dozen protected fields then costs one query, not
twelve. A short-TTL cache (30–60s) keyed on `employeeId` can layer on top later
if load justifies it, at the cost of that much delay on revocation.

## Operation map

Every operation currently exposed, and the permission it should carry. `TENANT`
means owner-only (no employee grant, no customer access).

### Product — `product.resolver.ts`

| Operation           | Feature   | Action |
| ------------------- | --------- | ------ |
| `getAllProducts`    | `CATALOG` | VIEW   |
| `getProductById`    | `CATALOG` | VIEW   |
| `createProduct`     | `CATALOG` | CREATE |
| `updateProduct`     | `CATALOG` | EDIT   |
| `archiveVariant`    | `CATALOG` | EDIT   |
| `restoreVariant`    | `CATALOG` | EDIT   |
| `restoreProduct`    | `CATALOG` | EDIT   |
| `softDeleteProduct` | `CATALOG` | DELETE |
| `hardDeleteProduct` | `CATALOG` | DELETE |
| `removeVariant`     | `CATALOG` | DELETE |

`hardDeleteProduct` is irreversible where `softDeleteProduct` is not, yet both
map to `CATALOG:DELETE`. If that gap matters, make hard delete owner-only rather
than inventing a fifth action.

### Category — `category.resolver.ts`

| Operation           | Feature   | Action |
| ------------------- | --------- | ------ |
| `getAllCategories`  | `CATALOG` | VIEW   |
| `getCategoryById`   | `CATALOG` | VIEW   |
| `createCategory`    | `CATALOG` | CREATE |
| `updateCategory`    | `CATALOG` | EDIT   |
| `deleteCategory`    | `CATALOG` | DELETE |

Categories share `CATALOG` with products deliberately — a shop owner thinks of
them as one thing, and a separate feature would be a distinction without a
difference.

### Inventory — `inventory.resolver.ts`

| Operation                | Feature     | Action |
| ------------------------ | ----------- | ------ |
| `getAllWarehouses`       | `INVENTORY` | VIEW   |
| `getWarehouseById`       | `INVENTORY` | VIEW   |
| `getAllStockMovements`   | `INVENTORY` | VIEW   |
| `createWarehouse`        | `INVENTORY` | CREATE |
| `updateWarehouse`        | `INVENTORY` | EDIT   |
| `addStockToWarehouse`    | `INVENTORY` | EDIT   |
| `updateStockInWarehouse` | `INVENTORY` | EDIT   |
| `removeStockFromWarehouse` | `INVENTORY` | EDIT |
| `deleteWarehouse`        | `INVENTORY` | DELETE |

Stock adjustments are `EDIT`, not `DELETE` — removing stock is routine daily
work, while deleting a warehouse is structural.

### Customer — `customer.resolver.ts`

Mixed audience: staff administering customers, and customers acting on their own
records.

| Operation                        | Staff             | Customer                    |
| -------------------------------- | ----------------- | --------------------------- |
| `getCustomerById`                | `CUSTOMERS:VIEW`  | own record only             |
| `getCustomerReviews`             | `CUSTOMERS:VIEW`  | own reviews                 |
| `getWishListItems`               | `CUSTOMERS:VIEW`  | own wishlist                |
| `updateCustomer`                 | `CUSTOMERS:EDIT`  | own record only             |
| `addReviewProduct`               | —                 | ✅ own                      |
| `updateReviewProduct`            | —                 | ✅ own                      |
| `deleteReviewProduct`            | `CUSTOMERS:DELETE`| ✅ own                      |
| `addVariantToWishList`           | —                 | ✅ own                      |
| `removeVariantFromWishList`      | —                 | ✅ own                      |
| `removeManyVariantsFromWishList` | —                 | ✅ own                      |

Every ✅ row requires an ownership check in the handler. `getCustomerById` is
the sharp edge: with only an account-type gate, any customer could read any
other customer's record by ID.

### Cart — `cart.resolver.ts`

| Operation                | Staff          | Customer |
| ------------------------ | -------------- | -------- |
| `getCart`                | `ORDERS:VIEW`  | own cart |
| `addItemToCart`          | `ORDERS:EDIT`  | own cart |
| `updateItemQty`          | `ORDERS:EDIT`  | own cart |
| `removeItemFromCart`     | `ORDERS:EDIT`  | own cart |
| `removeManyItemsFromCart`| `ORDERS:EDIT`  | own cart |

All customer-reachable, all ownership-checked.

### Address — `address.resolver.ts`

`Address` is already polymorphic (`resolveAddressOwner` enforces exactly one of
`tenantId`/`customerId`), so ownership plumbing largely exists.

| Operation              | Staff              | Customer      |
| ---------------------- | ------------------ | ------------- |
| `getAllCountries`      | `@Public()`        | `@Public()`   |
| `getStatesByCountryId` | `@Public()`        | `@Public()`   |
| `getAllAddresses`      | `SETTINGS:VIEW`    | own addresses |
| `getAddressById`       | `SETTINGS:VIEW`    | own addresses |
| `createAddress`        | `SETTINGS:CREATE`  | own addresses |
| `updateAddress`        | `SETTINGS:EDIT`    | own addresses |
| `deleteAddress`        | `SETTINGS:DELETE`  | own addresses |

Countries and states are static geographic reference data with nothing tenant-
specific in them — public, and cheaper to serve unauthenticated.

### Tenant — `tenant.resolver.ts`

| Operation      | Permission        |
| -------------- | ----------------- |
| `getTenantById`| `SETTINGS:VIEW`   |
| `updateTenant` | **TENANT only**   |

Store identity, domain, and currency are owner decisions. An employee with
`SETTINGS:EDIT` should not be able to repoint the store's domain.

### Analytics — `analytics.resolver.ts`

| Operation      | Permission      |
| -------------- | --------------- |
| `getDashboard` | `REPORTS:VIEW`  |

Revenue figures are exactly what a tenant expects to withhold from junior staff;
this is the main reason `REPORTS` exists as its own feature.

### Media — `media.resolver.ts`

| Operation         | Permission              |
| ----------------- | ----------------------- |
| `getMediaAuth`    | `CATALOG:CREATE`        |

Issues upload credentials. Gate it at the same level as creating the catalog
content the uploads are for — anyone who can obtain upload credentials can
write to your media store.

### Authentication — `authentication.resolver.ts`

Unchanged. Already `@Public()` / `@Authenticated()`; these are the operations by
which identity is established, so feature permissions do not apply.

## Rollout

1. **Schema + JWT.** Add the action column, `isSystem`, unique constraints, and
   `accountType` in the payload. Seed the feature catalog and presets. Nothing
   is enforced yet; nothing breaks.
2. **Guard in warn mode.** Ship `PermissionsGuard` with unannotated operations
   *allowed* but logged. The log becomes the exact worklist for step 3, drawn
   from real traffic rather than from this document.
3. **Annotate.** Work through the operation map above. The log from step 2
   should drain to nothing.
4. **Flip to deny.** Unannotated now means denied. From here a new resolver
   without a decorator fails immediately and visibly, which is the desired
   failure mode.
5. **Ownership checks.** Add customer ownership assertions in handlers. Worth
   tracking separately from steps 3–4 because a guard cannot verify these and
   green tests will not notice their absence.

Steps 1–4 are guard-layer and mechanical. Step 5 is per-handler and is where
real bugs hide — every ✅ in the Customer and Cart tables is a place where a
missing check silently exposes one customer's data to another.

## Testing

- **Guard unit tests** — the decision order above, case by case, especially
  tenant short-circuit and the unannotated-operation default.
- **Permission resolution** — an employee's grid maps to the right allow/deny
  set; revoking a grant takes effect on the next request, not the next login.
- **Cross-tenant isolation** — an employee of tenant A is denied on tenant B's
  records even holding the right feature grant. Tenant scoping and permission
  checks are independent, and passing one says nothing about the other.
- **Customer ownership** — for each ✅ operation, a customer is denied another
  customer's record. This is the class of bug the guard cannot catch.
- **Preset correctness** — each seeded preset grants what the table says, since
  a wrong preset silently misconfigures every tenant that picks it.

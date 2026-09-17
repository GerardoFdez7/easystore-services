import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const checker = join(process.cwd(), 'tools/architecture/check.mjs');
function run(schema, jwt = 'export interface JwtPayload { tenantId: string; storeId: string; }') {
  const root = mkdtempSync(join(tmpdir(), 'architecture-store-'));
  const schemaPath = join(root, 'schema.prisma'); const jwtPath = join(root, 'jwt.ts');
  writeFileSync(schemaPath, schema); writeFileSync(jwtPath, jwt);
  const result = spawnSync(process.execPath, [checker], { encoding: 'utf8', env: { ...process.env, ARCHITECTURE_DOMAINS_ROOT: root, ARCHITECTURE_SCHEMA_PATH: schemaPath, ARCHITECTURE_JWT_PATH: jwtPath, ARCHITECTURE_SCHEMA_FIXTURE: 'true' } });
  rmSync(root, { recursive: true, force: true }); return result;
}
function runAggregateOwned(schema) {
  const root = mkdtempSync(join(tmpdir(), 'architecture-aggregate-owned-'));
  const schemaPath = join(root, 'schema.prisma'); const jwtPath = join(root, 'jwt.ts');
  writeFileSync(schemaPath, schema); writeFileSync(jwtPath, 'export interface JwtPayload { tenantId: string; storeId: string; }');
  const result = spawnSync(process.execPath, [checker], { encoding: 'utf8', env: { ...process.env, ARCHITECTURE_DOMAINS_ROOT: root, ARCHITECTURE_SCHEMA_PATH: schemaPath, ARCHITECTURE_JWT_PATH: jwtPath, ARCHITECTURE_SCHEMA_FIXTURE: 'true', ARCHITECTURE_AGGREGATE_OWNED_FIXTURE: 'true' } });
  rmSync(root, { recursive: true, force: true }); return result;
}
const valid = `model Store { id String @id tenantId String }\nmodel Subscription { id String @id storeId String store Store @relation(fields: [storeId], references: [id]) }\nmodel StockPerWarehouse { id String @id storeId String store Store @relation(fields: [storeId], references: [id]) }`;
test('accepts Store-scoped schema and both JWT scopes', () => { const result = run(valid); assert.equal(result.status, 0, result.stdout + result.stderr + result.error); });
test('reports missing Store scope', () => { const r = run(valid.replace('storeId String', '')); assert.notEqual(r.status, 0); });
test('reports stale operational Tenant scope', () => { const r = run(valid.replace('storeId String', 'tenantId String')); assert.notEqual(r.status, 0); });
test('reports unqualified Store parent relation', () => { const r = run(valid.replaceAll('fields: [storeId]', 'fields: [warehouseId]')); assert.notEqual(r.status, 0); });
test('reports a missing JWT store claim separately', () => { const r = run(valid, 'export interface JwtPayload { tenantId: string; }'); assert.notEqual(r.status, 0); });
const aggregateOwned = `model Product { id String @id }\nmodel Variant { id String @id }\nmodel Attribute { id String @id variantId String variant Variant @relation(fields: [variantId], references: [id]) }\nmodel Dimension { id String @id variantId String variant Variant @relation(fields: [variantId], references: [id]) }\nmodel Warranty { id String @id variantId String variant Variant @relation(fields: [variantId], references: [id]) }\nmodel InstallmentPayment { id String @id variantId String variant Variant @relation(fields: [variantId], references: [id]) }\nmodel Sustainability { id String @id productId String product Product @relation(fields: [productId], references: [id]) }`;
test('accepts aggregate-owned children that derive Store ownership', () => { const result = runAggregateOwned(aggregateOwned); assert.equal(result.status, 0, result.stdout + result.stderr + result.error); });
test('reports redundant Store scope on an aggregate-owned child', () => { const r = runAggregateOwned(aggregateOwned.replace('variantId String variant', 'variantId String storeId String variant')); assert.notEqual(r.status, 0); });
test('reports redundant Store scope on a Product-owned child', () => { const r = runAggregateOwned(aggregateOwned.replace('productId String product', 'productId String storeId String product')); assert.notEqual(r.status, 0); });

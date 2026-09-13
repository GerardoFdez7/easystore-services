import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('authorization migration', () => {
  const migration = readFileSync(
    join(__dirname, '20260905165823_authorization', 'migration.sql'),
    'utf8',
  );

  it('rejects existing cross-tenant employee and role-feature links', () => {
    expect(migration).toContain('r."tenantId" <> e."tenantId"');
    expect(migration).toContain('r."tenantId" <> rf."tenantId"');
    expect(migration).toContain(
      "RAISE EXCEPTION 'Cannot add tenant-scoped role foreign keys: mismatched role links exist'",
    );
  });
});

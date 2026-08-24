import bcrypt from 'bcrypt';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Id } from '../../../domains/shared/value-objects';
import {
  createDevelopmentFixtureIds,
  developmentSeedAccounts,
  developmentSeedPassword,
  developmentSeedPasswordHash,
  validateDevelopmentFixtures,
} from './development.seed';

describe('development database seed fixtures', () => {
  it('uses stable UUIDs for idempotent fixture upserts', () => {
    const firstRunIds = Object.values(createDevelopmentFixtureIds());
    const secondRunIds = Object.values(createDevelopmentFixtureIds());

    firstRunIds.forEach((id) => Id.create(id));
    expect(new Set(firstRunIds).size).toBe(firstRunIds.length);
    expect(secondRunIds).toEqual(firstRunIds);
  });

  it('passes the applicable domain validators', () => {
    expect(validateDevelopmentFixtures).not.toThrow();
  });

  it('uses a bcrypt hash for the documented development password', async () => {
    await expect(
      bcrypt.compare(developmentSeedPassword, developmentSeedPasswordHash),
    ).resolves.toBe(true);
    expect(developmentSeedAccounts).toEqual([
      { email: 'owner@easystore.lat', accountType: 'TENANT' },
      { email: 'customer@easystore.lat', accountType: 'CUSTOMER' },
      { email: 'manager@easystore.lat', accountType: 'EMPLOYEE' },
    ]);
  });

  it('documents the development credentials outside runtime seed output', () => {
    const readme = readFileSync(join(__dirname, 'README.md'), 'utf8');

    developmentSeedAccounts.forEach(({ email, accountType }) => {
      expect(readme).toContain(email);
      expect(readme).toContain(accountType);
    });
    expect(readme).toContain(developmentSeedPassword);
  });
});

import { readFileSync } from 'fs';
import { join } from 'path';
import { $Enums } from '.prisma/postgres';
import { Currency, CurrencyCodes } from '../currency.vo';

const sorted = (values: string[]) => [...values].sort();

describe('Currency', () => {
  it('accepts every supported code and rejects anything else', () => {
    for (const code of Object.values(CurrencyCodes)) {
      expect(Currency.create(code).getValue()).toBe(code);
    }
    expect(() => Currency.create('EUR')).toThrow();
    expect(() => Currency.create('')).toThrow();
    expect(() => Currency.create(null as never)).toThrow();
  });

  describe('stays in sync with the other places that list currencies', () => {
    it('matches the Prisma Currency enum', () => {
      expect(sorted(Object.values($Enums.Currency))).toEqual(
        sorted(Object.values(CurrencyCodes)),
      );
    });

    it('matches the GraphQL CurrencyCodes enum in schema.gql', () => {
      const schema = readFileSync(
        join(process.cwd(), 'src/infrastructure/graphql/schema.gql'),
        'utf8',
      );
      const block = /enum CurrencyCodes \{([^}]*)\}/.exec(schema)?.[1] ?? '';
      const schemaValues = block.split(/\s+/).filter(Boolean);

      expect(sorted(schemaValues)).toEqual(
        sorted(Object.values(CurrencyCodes)),
      );
    });

    it('matches the currency enum in the latest migration', () => {
      const migration = readFileSync(
        join(
          process.cwd(),
          'src/infrastructure/database/migrations/20261005061305_monetary_contract/migration.sql',
        ),
        'utf8',
      );
      const values =
        /"Currency_new" AS ENUM \(([^)]*)\)/.exec(migration)?.[1] ?? '';
      const migrationValues = values
        .split(',')
        .map((value) => value.trim().replace(/'/g, ''));

      expect(sorted(migrationValues)).toEqual(
        sorted(Object.values(CurrencyCodes)),
      );
    });
  });
});

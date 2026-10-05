import { readFileSync } from 'fs';
import { join } from 'path';
import { CurrencyMismatchError, Money } from '../money.vo';
import { CurrencyCodes } from '../currency.vo';

interface Vectors {
  normalize: [string, string][];
  round: [string, string][];
  allocate: { total: string; weights: number[]; expected: string[] }[];
  validAmounts: string[];
  invalidAmounts: string[];
}

const vectors = JSON.parse(
  readFileSync(join(process.cwd(), 'docs/monetary-test-vectors.json'), 'utf8'),
) as Vectors;

describe('Money', () => {
  describe('shared vectors', () => {
    it.each(vectors.normalize)('normalizes %s to %s', (input, expected) => {
      expect(Money.normalizeAmount(input)).toBe(expected);
    });

    it.each(vectors.round)(
      'rounds %s half away from zero to %s',
      (input, expected) => {
        expect(Money.roundAmount(input)).toBe(expected);
      },
    );

    it.each(vectors.allocate)(
      'allocates $total across $weights',
      ({ total, weights, expected }) => {
        const shares = Money.allocateAmount(total, weights);
        expect(shares).toEqual(expected);
        expect(
          shares.reduce((sum, share) => Money.addAmounts(sum, share), '0'),
        ).toBe(Money.normalizeAmount(total));
      },
    );

    it.each(vectors.validAmounts)('accepts %s', (amount) => {
      expect(() => Money.create(amount, 'GTQ')).not.toThrow();
    });

    it.each(vectors.invalidAmounts)('rejects %p', (amount) => {
      expect(() => Money.create(amount, 'GTQ')).toThrow();
    });
  });

  describe('integer amounts', () => {
    it('keeps whole numbers exact in arithmetic and comparison', () => {
      expect(Money.addAmounts('1', '2')).toBe('3');
      expect(Money.multiplyAmount('10', 3)).toBe('30');
      expect(Money.compareAmounts('1', '0.5')).toBe(1);
      expect(Money.compareAmounts('10', '10.0')).toBe(0);
    });
  });

  describe('scale', () => {
    it('rejects more than two decimal places instead of rounding', () => {
      expect(() => Money.create('12.505', 'USD')).toThrow(
        /at most 2 decimal places/,
      );
    });

    it('treats trailing zeros as no extra scale', () => {
      expect(Money.create('12.500', 'USD').getValue().amount).toBe('12.5');
    });
  });

  describe('currency rules', () => {
    it.each(['JPY', 'KWD', 'XDR', 'EUR', 'CLP', 'COP'])(
      'rejects unsupported currency %s',
      (currency) => {
        expect(() => Money.create('1', currency)).toThrow();
      },
    );

    it.each(['GTQ', 'USD'])('accepts supported currency %s', (currency) => {
      expect(Money.create('1', currency).getValue().currency).toBe(
        currency as CurrencyCodes,
      );
    });

    it('throws when combining different currencies', () => {
      const usd = Money.create('1', 'USD');
      const gtq = Money.create('1', 'GTQ');
      expect(() => usd.add(gtq)).toThrow(CurrencyMismatchError);
      expect(() => usd.subtract(gtq)).toThrow(CurrencyMismatchError);
      expect(() => usd.compareTo(gtq)).toThrow(CurrencyMismatchError);
    });

    it('adds, subtracts, compares and multiplies within one currency', () => {
      const a = Money.create('10.25', 'USD');
      const b = Money.create('0.75', 'USD');
      expect(a.add(b).getValue().amount).toBe('11');
      expect(a.subtract(b).getValue().amount).toBe('9.5');
      expect(a.compareTo(b)).toBe(1);
      expect(b.multiply(3).getValue().amount).toBe('2.25');
    });
  });
});

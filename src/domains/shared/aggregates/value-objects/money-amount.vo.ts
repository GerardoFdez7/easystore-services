import { Money } from './money.vo';

/**
 * A monetary amount without a currency, for values priced in a currency owned by an
 * aggregate (a variant price is in its product's currency). It has the same scale and
 * normalization rules as {@link Money}.
 */
export class MoneyAmount {
  private constructor(private readonly value: string) {}

  /** Rejects more than 2 decimals instead of rounding, like {@link Money.create}. */
  static create(amount: string): MoneyAmount {
    return new MoneyAmount(Money.create(amount, 'USD').getValue().amount);
  }

  getValue(): string {
    return this.value;
  }

  /** Prices the amount in `currency`. */
  toMoney(currency: string): Money {
    return Money.create(this.value, currency);
  }

  equals(other: MoneyAmount): boolean {
    return this.value === other.value;
  }
}

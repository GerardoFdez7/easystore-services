import { z } from 'zod/v4';
import { Currency, CurrencyCodes } from './currency.vo';

const decimalAmountSchema = z.string().refine((value) => {
  const unsignedValue = value.startsWith('-') ? value.slice(1) : value;
  const decimalPoint = unsignedValue.indexOf('.');
  const integerPart =
    decimalPoint === -1 ? unsignedValue : unsignedValue.slice(0, decimalPoint);
  const fractionalPart =
    decimalPoint === -1 ? undefined : unsignedValue.slice(decimalPoint + 1);

  return (
    integerPart.length > 0 &&
    [...integerPart].every(
      (character) => character >= '0' && character <= '9',
    ) &&
    (fractionalPart === undefined ||
      (fractionalPart.length > 0 &&
        !fractionalPart.includes('.') &&
        [...fractionalPart].every(
          (character) => character >= '0' && character <= '9',
        )))
  );
}, 'Amount must be a decimal string');
export interface IMoney {
  amount: string;
  currency: CurrencyCodes;
}

/** An exact monetary amount in a validated ISO 4217 currency. */
export class Money {
  private constructor(private readonly value: IMoney) {}

  static create(amount: string, currency: string): Money {
    return new Money({
      amount: this.normalizeAmount(amount),
      currency: Currency.create(currency).getValue(),
    });
  }

  static normalizeAmount(amount: string): string {
    const validatedAmount = decimalAmountSchema.parse(amount);
    const isNegative = validatedAmount.startsWith('-');
    const unsignedAmount = isNegative
      ? validatedAmount.slice(1)
      : validatedAmount;
    const [integerPart, fractionalPart] = unsignedAmount.split('.');
    const normalizedInteger = integerPart.replace(/^0+(?=\d)/, '');
    const normalizedFraction = fractionalPart?.replace(/0+$/, '');
    const normalizedAmount = normalizedFraction
      ? `${normalizedInteger}.${normalizedFraction}`
      : normalizedInteger;

    return normalizedAmount === '0' || normalizedAmount === '0.0'
      ? '0'
      : `${isNegative ? '-' : ''}${normalizedAmount}`;
  }

  getValue(): IMoney {
    return { ...this.value };
  }

  equals(other: Money): boolean {
    return (
      this.value.amount === other.value.amount &&
      this.value.currency === other.value.currency
    );
  }
}

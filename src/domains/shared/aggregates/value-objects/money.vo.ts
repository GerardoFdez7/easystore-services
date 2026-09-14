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

  static compareAmounts(first: string, second: string): number {
    const left = this.toScaledInteger(first);
    const right = this.toScaledInteger(second);
    const scale = Math.max(left.scale, right.scale);
    const leftValue = left.value * 10n ** BigInt(scale - left.scale);
    const rightValue = right.value * 10n ** BigInt(scale - right.scale);
    return leftValue < rightValue ? -1 : leftValue > rightValue ? 1 : 0;
  }

  static addAmounts(first: string, second: string): string {
    const left = this.toScaledInteger(first);
    const right = this.toScaledInteger(second);
    const scale = Math.max(left.scale, right.scale);
    const value =
      left.value * 10n ** BigInt(scale - left.scale) +
      right.value * 10n ** BigInt(scale - right.scale);
    return this.fromScaledInteger(value, scale);
  }

  static multiplyAmount(amount: string, multiplier: number): string {
    if (!Number.isSafeInteger(multiplier) || multiplier < 0) {
      throw new Error('Money multiplier must be a non-negative safe integer');
    }
    const parsed = this.toScaledInteger(amount);
    return this.fromScaledInteger(
      parsed.value * BigInt(multiplier),
      parsed.scale,
    );
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

  private static toScaledInteger(amount: string): {
    value: bigint;
    scale: number;
  } {
    const normalized = this.normalizeAmount(amount);
    const isNegative = normalized.startsWith('-');
    const unsigned = isNegative ? normalized.slice(1) : normalized;
    const [integer, fraction = ''] = unsigned.split('.');
    const value = BigInt(`${integer}${fraction || '0'}`);
    return { value: isNegative ? -value : value, scale: fraction.length };
  }

  private static fromScaledInteger(value: bigint, scale: number): string {
    const negative = value < 0n;
    const digits = (negative ? -value : value)
      .toString()
      .padStart(scale + 1, '0');
    const integer = scale === 0 ? digits : digits.slice(0, -scale);
    const fraction = scale === 0 ? '' : `.${digits.slice(-scale)}`;
    return this.normalizeAmount(`${negative ? '-' : ''}${integer}${fraction}`);
  }
}

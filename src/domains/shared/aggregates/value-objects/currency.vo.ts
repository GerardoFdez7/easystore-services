import { z } from 'zod/v4';

/**
 * Currencies EasyStore can price and charge, shared by all bounded contexts.
 *
 * This enum is the single source of truth: the Prisma `Currency` enum, the GraphQL
 * `CurrencyCodes` enum, and the client's currency select all derive from it. To support
 * another currency, follow "Adding a currency" in docs/MONETARY-CONTRACT.md.
 */
export enum CurrencyCodes {
  GTQ = 'GTQ',
  USD = 'USD',
}

export const currencySchema = z.enum(CurrencyCodes);

export class Currency {
  private readonly value: CurrencyCodes;

  private constructor(value: CurrencyCodes) {
    this.value = value;
  }

  public static create(type: string): Currency {
    const validatedType = currencySchema.parse(type);
    return new Currency(validatedType);
  }

  public getValue(): CurrencyCodes {
    return this.value;
  }

  public equals(currency: Currency): boolean {
    return this.value === currency.value;
  }
}

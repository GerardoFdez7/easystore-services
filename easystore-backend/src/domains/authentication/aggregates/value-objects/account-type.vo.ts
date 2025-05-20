import { z } from 'zod';

export const AccountTypeEnum = z.enum(['TENANT', 'CUSTOMER', 'EMPLOYEE']);

export type AccountTypeType = z.infer<typeof AccountTypeEnum>;

export class AccountType {
  private constructor(private readonly value: AccountTypeType) {}

  public static create(value: string): AccountType {
    const parsed = AccountTypeEnum.parse(value);
    return new AccountType(parsed);
  }

  public getValue(): AccountTypeType {
    return this.value;
  }

  public equals(other: AccountType): boolean {
    return this.value === other.getValue();
  }
}

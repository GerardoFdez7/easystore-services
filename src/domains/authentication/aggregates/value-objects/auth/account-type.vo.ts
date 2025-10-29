import { z } from 'zod';

export enum AccountTypeEnum {
  TENANT = 'TENANT',
  CUSTOMER = 'CUSTOMER',
  EMPLOYEE = 'EMPLOYEE',
}

export const AccountTypeSchema = z.enum(AccountTypeEnum);

export class AccountType {
  private constructor(private readonly value: AccountTypeEnum) {}

  public static create(value: string): AccountType {
    const parsed = AccountTypeSchema.parse(value);
    return new AccountType(parsed);
  }

  public getValue(): AccountTypeEnum {
    return this.value;
  }

  public equals(other: AccountType): boolean {
    return this.value === other.getValue();
  }
}

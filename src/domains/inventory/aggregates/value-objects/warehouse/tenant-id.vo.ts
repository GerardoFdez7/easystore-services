import { z } from 'zod';

const tenantIdSchema = z
  .string()
  .min(1, { message: 'Tenant ID must be a non-empty string' })
  .uuid({ message: 'Tenant ID must be a valid UUID' });

export class TenantId {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static create(value: string): TenantId {
    const validatedValue = tenantIdSchema.parse(value);
    return new TenantId(validatedValue);
  }

  public getValue(): string {
    return this.value;
  }

  public equals(otherTenantId: TenantId): boolean {
    return this.value === otherTenantId.value;
  }
} 
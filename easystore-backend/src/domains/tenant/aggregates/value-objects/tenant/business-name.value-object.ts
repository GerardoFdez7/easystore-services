import { z } from 'zod';

const businessNameSchema = z
  .string()
  .min(2, { message: 'Business name must be at least 2 characters' })
  .max(50, { message: 'Business name must be at most 50 characters' });

export class BusinessName {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static create(name: string): BusinessName {
    businessNameSchema.parse(name);
    return new BusinessName(name);
  }

  public getValue(): string {
    return this.value;
  }

  public equals(businessName: BusinessName): boolean {
    return this.value === businessName.value;
  }
}

import { z } from 'zod';

const ownerNameSchema = z
  .string()
  .min(2, { message: 'Owner name must be at least 2 characters' })
  .max(100, { message: 'Owner name must be at most 100 characters' });

export class OwnerName {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static create(name: string): OwnerName {
    ownerNameSchema.parse(name);
    return new OwnerName(name);
  }

  public getValue(): string {
    return this.value;
  }

  public equals(ownerName: OwnerName): boolean {
    return this.value === ownerName.value;
  }
}

import { z } from 'zod';

const addressIdSchema = z
  .string()
  .min(1, { message: 'Address ID must be a non-empty string' })
  .uuid({ message: 'Address ID must be a valid UUID' });

export class AddressId {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static create(value: string): AddressId {
    const validatedValue = addressIdSchema.parse(value);
    return new AddressId(validatedValue);
  }

  public getValue(): string {
    return this.value;
  }

  public equals(otherAddressId: AddressId): boolean {
    return this.value === otherAddressId.value;
  }
} 
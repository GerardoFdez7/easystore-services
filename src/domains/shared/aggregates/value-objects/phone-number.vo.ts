import { z } from 'zod';

const phoneNumberSchema = z
  .string()
  .regex(/^\+?[0-9\s\-()]{7,20}$/, { message: 'Invalid phone number format' })
  .nullable();

export class PhoneNumber {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static create(phoneNumber: string): PhoneNumber {
    phoneNumberSchema.parse(phoneNumber);
    return new PhoneNumber(phoneNumber);
  }

  public getValue(): string {
    return this.value;
  }

  public equals(phoneNumber: PhoneNumber): boolean {
    return this.value === phoneNumber.value;
  }
}

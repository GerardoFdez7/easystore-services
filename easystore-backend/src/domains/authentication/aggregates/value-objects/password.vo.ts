import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(6, { message: 'Password must be at least 6 characters' });

export class Password {
  private constructor(private readonly value: string) {}

  public static create(value: string): Password {
    passwordSchema.parse(value);
    return new Password(value);
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: Password): boolean {
    return this.value === other.getValue();
  }
}

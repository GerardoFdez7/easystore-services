import { z } from 'zod';

const emailSchema = z.string().email({ message: 'Invalid email format' });

export class Email {
  private constructor(private readonly value: string) {}

  public static create(value: string): Email {
    emailSchema.parse(value);
    return new Email(value);
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: Email): boolean {
    return this.value === other.getValue();
  }
}

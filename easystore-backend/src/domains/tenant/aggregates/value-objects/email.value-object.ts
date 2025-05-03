import { z } from 'zod';

const emailSchema = z.string().email({ message: 'Invalid email format' });

export class Email {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static create(email: string): Email {
    emailSchema.parse(email);
    return new Email(email);
  }

  public getValue(): string {
    return this.value;
  }

  public equals(email: Email): boolean {
    return this.value === email.value;
  }
}

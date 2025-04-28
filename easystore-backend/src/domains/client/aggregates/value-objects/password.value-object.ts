import { z } from 'zod';
import * as bcrypt from 'bcrypt';

const passwordSchema = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters long' });

export class Password {
  private readonly value: string;
  private readonly hashed: boolean;

  private constructor(value: string, hashed: boolean) {
    this.value = value;
    this.hashed = hashed;
  }

  public static create(password: string): Password {
    passwordSchema.parse(password);
    return new Password(password, false);
  }

  public static createHashed(hashedPassword: string): Password {
    return new Password(hashedPassword, true);
  }

  public async getHashedValue(): Promise<string> {
    if (this.hashed) {
      return this.value;
    }
    return await bcrypt.hash(this.value, 10);
  }

  public getValue(): string {
    return this.value;
  }

  public async comparePassword(plainTextPassword: string): Promise<boolean> {
    if (!this.hashed) {
      return this.value === plainTextPassword;
    }
    return await bcrypt.compare(plainTextPassword, this.value);
  }
}

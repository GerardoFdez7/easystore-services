import { z } from 'zod';

const LogoSchema = z
  .string()
  .url({ message: 'Invalid URL format for logo' })
  .nullable();

export class Logo {
  private readonly value: string | null;

  private constructor(value: string | null) {
    this.value = value;
  }

  public static create(value: string | null): Logo {
    LogoSchema.parse(value);
    return new Logo(value);
  }

  public getValue(): string | null {
    return this.value;
  }

  public equals(other: Logo): boolean {
    return this.value === other.getValue();
  }
}

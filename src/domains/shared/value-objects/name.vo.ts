import { z } from 'zod';

const nameSchema = z
  .string()
  .min(2, { message: 'Name must be at least 2 characters' })
  .max(100, { message: 'Name must be at most 100 characters' });

export class Name {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static create(name: string): Name {
    nameSchema.parse(name);
    return new Name(name);
  }

  public getValue(): string {
    return this.value;
  }

  public equals(name: Name): boolean {
    return this.value === name.value;
  }
}

import { z } from 'zod';

const isbnSchema = z
  .string()
  .min(1, { message: 'ISBN must be a non-empty string' })
  .nullable();

export class ISBN {
  private readonly value: string | null;

  private constructor(value: string | null) {
    this.value = value;
  }

  public static create(value: string | null): ISBN {
    isbnSchema.parse(value);
    return new ISBN(value);
  }

  public getValue(): string | null {
    return this.value;
  }

  public equals(otherISBN: ISBN): boolean {
    return this.value === otherISBN.value;
  }
}

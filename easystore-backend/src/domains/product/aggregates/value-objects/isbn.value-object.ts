import { z } from 'zod';

const isbnSchema = z
  .string()
  .min(1, { message: 'ISBN must be a non-empty string' })
  .optional();

export class ISBN {
  private readonly value: string | null | undefined;

  private constructor(value: string | null | undefined) {
    this.value = value;
  }

  public static create(value: string | null | undefined): ISBN {
    isbnSchema.parse(value);
    return new ISBN(value);
  }

  public getValue(): string | null | undefined {
    return this.value;
  }

  public equals(otherISBN: ISBN): boolean {
    return this.value === otherISBN.value;
  }
}

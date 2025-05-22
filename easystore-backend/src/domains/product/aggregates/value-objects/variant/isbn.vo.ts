import { z } from 'zod';

const isbnSchema = z
  .string()
  .regex(/^(?:(?:\d{9}[\dX])|(?:(?:978|979)\d{10}))$/, {
    message:
      'ISBN must be a valid ISBN-10 (e.g., 0321765723 or 032176572X) or ISBN-13 (e.g., 9780321765723) code. Do not include hyphens.',
  })
  .nullable();

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

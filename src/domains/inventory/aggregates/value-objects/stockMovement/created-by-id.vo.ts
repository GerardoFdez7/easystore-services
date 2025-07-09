import { z } from 'zod';

const createdByIdSchema = z
  .string()
  .min(1, { message: 'Created by ID must be a non-empty string' })
  .uuid({ message: 'Created by ID must be a valid UUID' })
  .nullable();

export class CreatedById {
  private readonly value: string | null;

  private constructor(value: string | null) {
    this.value = value;
  }

  public static create(value: string | null): CreatedById {
    const validatedValue = createdByIdSchema.parse(value);
    return new CreatedById(validatedValue);
  }

  public static createNull(): CreatedById {
    return new CreatedById(null);
  }

  public getValue(): string | null {
    return this.value;
  }

  public equals(otherCreatedById: CreatedById): boolean {
    return this.value === otherCreatedById.value;
  }

  public isNull(): boolean {
    return this.value === null;
  }

  public hasValue(): boolean {
    return this.value !== null;
  }
} 
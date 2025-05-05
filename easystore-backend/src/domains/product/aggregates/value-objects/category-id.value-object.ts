import { z } from 'zod';

const categoryIdSchema = z
  .string()
  .length(24, { message: 'CategoryId must be 24 hex characters' })
  .regex(/^[0-9a-fA-F]+$/, {
    message: 'CategoryId must be a valid hex string',
  });

export class CategoryId {
  private readonly categoryId: string;

  private constructor(categoryId: string) {
    this.categoryId = categoryId;
  }

  public static create(categoryId: string): CategoryId {
    categoryIdSchema.parse(categoryId);
    return new CategoryId(categoryId);
  }

  public getValue(): string {
    return this.categoryId;
  }

  public equals(category: CategoryId): boolean {
    return this.categoryId === category.categoryId;
  }
}

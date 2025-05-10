import { z } from 'zod';

const tagsSchema = z
  .array(
    z
      .string()
      .min(1, { message: 'Each tag must be a non-empty string' })
      .max(50, { message: 'Each tag must be at most 50 characters long' }),
  )
  .max(15, { message: 'You can have a maximum of 15 tags' });

export class Tags {
  private readonly tags: string[];

  private constructor(tags: string[]) {
    this.tags = tags;
  }

  public static create(tags: string[]): Tags {
    tagsSchema.parse(tags);
    return new Tags(tags);
  }

  public getValue(): string[] {
    return this.tags;
  }

  public equals(otherTags: Tags): boolean {
    return JSON.stringify(this.tags) === JSON.stringify(otherTags.tags);
  }
}

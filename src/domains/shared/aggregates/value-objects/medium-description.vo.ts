import { z } from 'zod';

const mediumDescriptionSchema = z
  .string()
  .min(20, { message: 'Medium description must be at least 20 characters' })
  .max(1000, { message: 'Medium description must be at most 1000 characters' })
  .nullable();

export class MediumDescription {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static create(description: string): MediumDescription {
    mediumDescriptionSchema.parse(description);
    return new MediumDescription(description);
  }

  public getValue(): string {
    return this.value;
  }

  public equals(mediumDescription: MediumDescription): boolean {
    return this.value === mediumDescription.value;
  }
}

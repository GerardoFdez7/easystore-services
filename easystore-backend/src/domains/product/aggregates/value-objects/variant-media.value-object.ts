import { z } from 'zod';

const variantMediaUrlSchema = z
  .string()
  .url({ message: 'Product Media must be a valid URL' });

export class VariantMedia {
  private readonly values: string;

  private constructor(values: string) {
    this.values = values;
  }

  public static create(urls: string): VariantMedia {
    variantMediaUrlSchema.parse(urls);
    return new VariantMedia(urls);
  }

  public getValue(): string {
    return this.values;
  }

  public equals(otherMedia: VariantMedia): boolean {
    return JSON.stringify(this.values) === JSON.stringify(otherMedia.values);
  }
}

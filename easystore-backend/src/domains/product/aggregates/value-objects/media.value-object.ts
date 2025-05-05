import { z } from 'zod';

const mediaUrlSchema = z
  .string()
  .url({ message: 'Product Media must be a valid URL' });

export class Media {
  private readonly values: string;

  private constructor(values: string) {
    this.values = values;
  }

  public static create(url: string): Media {
    mediaUrlSchema.parse(url);
    return new Media(url);
  }

  public getValues(): string {
    return this.values;
  }

  public equals(otherMedia: Media): boolean {
    return JSON.stringify(this.values) === JSON.stringify(otherMedia.values);
  }
}

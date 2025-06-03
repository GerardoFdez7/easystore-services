import { z } from 'zod/v4';

const urlSchema = z.url({ message: 'Invalid media URL format' });

export class Url {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static create(value: string): Url {
    urlSchema.parse(value);
    return new Url(value);
  }

  public getValue(): string {
    return this.value;
  }

  public equals(url: Url): boolean {
    return this.value === url.value;
  }
}

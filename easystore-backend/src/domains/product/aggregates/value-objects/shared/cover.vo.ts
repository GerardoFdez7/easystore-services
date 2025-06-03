import { z } from 'zod/v4';

const coverSchema = z.url({ message: 'Invalid cover URL' });

export class Cover {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static create(coverUrl: string): Cover {
    coverSchema.parse(coverUrl);
    return new Cover(coverUrl);
  }

  public getValue(): string {
    return this.value;
  }

  public equals(productCover: Cover): boolean {
    return this.value === productCover.value;
  }
}

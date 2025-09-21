import { z } from 'zod/v4';

const mediaSchema = z.url({ message: 'Invalid media URL' }).nullable();

export class Media {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static create(mediaUrl: string): Media {
    mediaSchema.parse(mediaUrl);
    return new Media(mediaUrl);
  }

  public getValue(): string {
    return this.value;
  }

  public equals(productMedia: Media): boolean {
    return this.value === productMedia.value;
  }
}

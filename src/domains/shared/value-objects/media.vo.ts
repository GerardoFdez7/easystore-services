import { z } from 'zod/v4';

const mediaSchema = z.url({ message: 'Invalid media URL' }).nullable();

const coverSchema = z.url({ message: 'Invalid cover URL' });

export class Media {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static create(mediaUrl: string): Media {
    mediaSchema.parse(mediaUrl);
    return new Media(mediaUrl);
  }

  public static createCover(coverUrl: string): Media {
    coverSchema.parse(coverUrl);
    return new Media(coverUrl);
  }

  public getValue(): string {
    return this.value;
  }

  public equals(productMedia: Media): boolean {
    return this.value === productMedia.value;
  }
}

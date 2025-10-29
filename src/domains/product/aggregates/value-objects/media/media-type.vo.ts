import { z } from 'zod';

export enum MediaTypeEnum {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
}

const mediaTypeSchema = z.enum(MediaTypeEnum);

export class MediaType {
  private readonly value: MediaTypeEnum;

  private constructor(value: MediaTypeEnum) {
    this.value = value;
  }

  public static create(value: string): MediaType {
    const validatedValue = mediaTypeSchema.parse(value);
    return new MediaType(validatedValue);
  }

  public getValue(): MediaTypeEnum {
    return this.value;
  }

  public equals(mediaType: MediaType): boolean {
    return this.value === mediaType.value;
  }
}

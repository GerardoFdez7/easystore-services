import { z } from 'zod';

const certificationSchema = z.string().nullable();

export class Certification {
  private readonly value: string | null;

  private constructor(value: string | null) {
    this.value = value;
  }

  public static create(value: string | null): Certification {
    certificationSchema.parse(value);
    return new Certification(value);
  }

  public getValue(): string | null {
    return this.value;
  }

  public equals(certification: Certification): boolean {
    return this.value === certification.value;
  }
}

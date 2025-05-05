import { z } from 'zod';

const sustainabilityAttributesSchema = z.object({
  certification: z
    .string()
    .min(1, { message: 'Certification must be a non-empty string' }),
  recycledPercentage: z.number().nonnegative({
    message: 'Recycled percentage must be a non-negative number',
  }),
});

export class SustainabilityAttribute {
  private readonly certification: string;
  private readonly recycledPercentage: number;

  private constructor(certification: string, recycledPercentage: number) {
    this.certification = certification;
    this.recycledPercentage = recycledPercentage;
  }

  public static create(attributes: {
    certification: string;
    recycledPercentage: number;
  }): SustainabilityAttribute {
    sustainabilityAttributesSchema.parse(attributes);
    return new SustainabilityAttribute(
      attributes.certification,
      attributes.recycledPercentage,
    );
  }

  public getValue(): {
    certification: string;
    recycledPercentage: number;
  } {
    return {
      certification: this.certification,
      recycledPercentage: this.recycledPercentage,
    };
  }

  public equals(otherAttributes: SustainabilityAttribute): boolean {
    return (
      this.certification === otherAttributes.certification &&
      this.recycledPercentage === otherAttributes.recycledPercentage
    );
  }
}

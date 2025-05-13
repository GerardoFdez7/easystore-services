import { z } from 'zod';

const sustainabilityAttributesSchema = z
  .object({
    certification: z
      .string()
      .min(1, { message: 'Certification must be a non-empty string' })
      .optional(),
    recycledPercentage: z.number().nonnegative({
      message: 'Recycled percentage must be a non-negative number',
    }),
  })
  .optional();

export type SustainabilityAttributesProps = {
  certification?: string | null;
  recycledPercentage: number;
};

export class SustainabilityAttribute {
  private readonly value: SustainabilityAttributesProps;

  private constructor(value: SustainabilityAttributesProps) {
    this.value = value;
  }

  public static create(
    value: SustainabilityAttributesProps,
  ): SustainabilityAttribute {
    sustainabilityAttributesSchema.parse(value);
    return new SustainabilityAttribute(value);
  }

  public getValue(): SustainabilityAttributesProps {
    return this.value;
  }

  public equals(otherAttributes: SustainabilityAttribute): boolean {
    return JSON.stringify(this.value) === JSON.stringify(otherAttributes.value);
  }
}

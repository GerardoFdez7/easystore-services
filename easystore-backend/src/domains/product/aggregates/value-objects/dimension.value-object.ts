import { z } from 'zod';

const dimensionSchema = z
  .object({
    height: z
      .number()
      .nonnegative({ message: 'Height must be a non-negative number' }),
    width: z
      .number()
      .nonnegative({ message: 'Width must be a non-negative number' }),
    depth: z
      .number()
      .nonnegative({ message: 'Depth must be a non-negative number' }),
  })
  .optional();

export type DimensionProps = {
  height: number;
  width: number;
  depth: number;
};

export class Dimension {
  private readonly value: DimensionProps;

  private constructor(value: DimensionProps) {
    this.value = value;
  }

  public static create(value: DimensionProps): Dimension {
    dimensionSchema.parse(value);
    return new Dimension(value);
  }

  public getValue(): DimensionProps {
    return this.value;
  }

  public equals(otherDimension: Dimension): boolean {
    return JSON.stringify(this.value) === JSON.stringify(otherDimension.value);
  }
}

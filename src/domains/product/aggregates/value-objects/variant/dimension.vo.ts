import { z } from 'zod';
import { Id } from '../';

const dimensionSchema = z.object({
  height: z
    .number()
    .nonnegative({ message: 'Height must be a non-negative number' }),
  width: z
    .number()
    .nonnegative({ message: 'Width must be a non-negative number' }),
  length: z
    .number()
    .nonnegative({ message: 'Length must be a non-negative number' }),
});

export type DimensionProps = {
  id?: string;
  height: number;
  width: number;
  length: number;
};

export class Dimension {
  private readonly value: DimensionProps;

  private constructor(value: DimensionProps) {
    this.value = value;
  }

  public static create(value: DimensionProps): Dimension {
    const dimensionId = value.id ? Id.create(value.id) : Id.generate();
    const dimensionData = { id: dimensionId.getValue(), ...value };
    dimensionSchema.parse(dimensionData);
    return new Dimension(dimensionData);
  }

  public getValue(): DimensionProps {
    return this.value;
  }

  public equals(otherDimension: Dimension): boolean {
    return JSON.stringify(this.value) === JSON.stringify(otherDimension.value);
  }
}

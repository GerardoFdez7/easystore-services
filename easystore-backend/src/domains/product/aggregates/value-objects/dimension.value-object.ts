import { z } from 'zod';

const dimensionSchema = z.object({
  height: z.number().positive({ message: 'Height must be a positive number' }),
  width: z.number().positive({ message: 'Width must be a positive number' }),
  depth: z.number().positive({ message: 'Depth must be a positive number' }),
});

export class Dimension {
  private readonly value: { height: number; width: number; depth: number };

  private constructor(value: { height: number; width: number; depth: number }) {
    this.value = value;
  }

  public static create(value: {
    height: number;
    width: number;
    depth: number;
  }): Dimension {
    dimensionSchema.parse(value);
    return new Dimension(value);
  }

  public getValue(): { height: number; width: number; depth: number } {
    return this.value;
  }

  public equals(otherDimension: Dimension): boolean {
    return JSON.stringify(this.value) === JSON.stringify(otherDimension.value);
  }
}

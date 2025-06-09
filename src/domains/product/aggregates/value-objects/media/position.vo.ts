import { z } from 'zod';

const positionSchema = z
  .number()
  .int()
  .min(0, { message: 'Position must be a non-negative integer' });

export class Position {
  private readonly value: number;

  private constructor(value: number) {
    this.value = value;
  }

  public static create(value: number): Position {
    positionSchema.parse(value);
    return new Position(value);
  }

  public getValue(): number {
    return this.value;
  }

  public equals(position: Position): boolean {
    return this.value === position.value;
  }
}

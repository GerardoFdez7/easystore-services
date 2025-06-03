import { z } from 'zod';

const IdSchema = z
  .number()
  .int()
  .positive({ message: 'Id must be a positive integer' })
  .nullable();

export class Id {
  private readonly value: number;

  private constructor(value: number) {
    this.value = value;
  }

  public static create(id: number): Id {
    IdSchema.parse(id);
    return new Id(id);
  }

  public getValue(): number {
    return this.value;
  }

  public equals(id: Id): boolean {
    return this.value === id.value;
  }
}

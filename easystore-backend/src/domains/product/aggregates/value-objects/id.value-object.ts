import { z } from 'zod';

const IdSchema = z
  .string()
  .length(24, { message: 'Id must be 24 hex characters' })
  .regex(/^[0-9a-fA-F]+$/, { message: 'Id must be a valid hex string' });

export class Id {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static create(id: string): Id {
    IdSchema.parse(id);
    return new Id(id);
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: Id): boolean {
    return this.value === other.value;
  }
}

import { z } from 'zod/v4';
import { v7 as uuidv7 } from 'uuid';

export const IdSchema = z
  .uuid({ message: 'Id must be a valid UUID' })
  .nullable();

export class Id {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static create(id: string): Id {
    IdSchema.parse(id);
    return new Id(id);
  }

  public static generate(): Id {
    const uuid = uuidv7();
    return new Id(uuid);
  }

  public getValue(): string {
    return this.value;
  }

  public equals(id: Id): boolean {
    return this.value === id.value;
  }
}
